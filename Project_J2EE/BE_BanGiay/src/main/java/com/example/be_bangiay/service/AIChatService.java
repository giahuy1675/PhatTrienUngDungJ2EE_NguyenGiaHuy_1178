package com.example.be_bangiay.service;

import com.example.be_bangiay.dto.ChatMessageDTO;
import com.example.be_bangiay.dto.ProductChatSuggestionDTO;
import com.example.be_bangiay.entity.Product;
import com.example.be_bangiay.exception.BadRequestException;
import com.example.be_bangiay.repository.ProductRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AIChatService {

    private static final String GEMINI_API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    private static final String SYSTEM_PROMPT = """
        Ban la Luna, tro ly tu van ban giay the thao cho website thuong mai dien tu.
        Nhiem vu cua ban la tu van giong nhan vien ban hang that: than thien, tu nhien, nhiet tinh, chuyen nghiep.

        Quy tac tra loi:
        - Luon noi bang tieng Viet tu nhien.
        - Duoc dung emoji vua phai, khong lam lo.
        - Neu khach chua noi ro nhu cau, hoi lai ngan gon va dung trong tam.
        - Ban co the tu van theo muc dich: chay bo, bong ro, di hoc, di choi, casual, tap gym.
        - Ban co the tu van theo size, mau, ngan sach, phong cach, gioi tinh, do om chan, de chan.
        - Khi goi y san pham, uu tien 3-4 san pham cu the trong danh sach duoc cung cap.
        - Moi san pham nen co: ten, gia, id san pham va 1 ly do ngan gon.
        - Neu khach hoi ve khuyen mai, chi noi theo du lieu duoc cung cap.
        - Tuyet doi khong tu tao gia, size, ton kho, uu dai neu khong co du lieu.
        - Neu du lieu chua du, noi ro va hoi them.

        Phong cach:
        - Giong nhan vien tu van ecommerce 2026, nhanh, goi y dung nhu cau, noi chuyen mem mai.
        - Cau van ngan gon, de doc tren khung chat.
        - Co the ket thuc bang 1 cau mo de khach noi tiep nhu cau.
        """;

    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public String chat(String message, List<ChatMessageDTO> history) {
        String cleanedMessage = message == null ? "" : message.trim();
        if (cleanedMessage.isEmpty()) {
            throw new BadRequestException("Tin nhan khong duoc de trong");
        }

        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new BadRequestException("Chua cau hinh gemini.api.key trong application.properties");
        }

        try {
            List<ProductChatSuggestionDTO> suggestions = suggestProducts(cleanedMessage, history);
            String productContext = buildProductContext(suggestions);
            return chatWithGemini(cleanedMessage, history, productContext);
        } catch (IOException e) {
            throw new BadRequestException("Khong parse duoc phan hoi tu Gemini: " + e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BadRequestException("Yeu cau toi Gemini bi gian doan");
        }
    }

    private String chatWithGemini(String message, List<ChatMessageDTO> history, String productContext)
        throws IOException, InterruptedException {
        String prompt = buildGeminiPrompt(message, history, productContext);
        String requestBody = objectMapper.writeValueAsString(
            Map.of(
                "contents", List.of(
                    Map.of(
                        "parts", List.of(
                            Map.of("text", prompt)
                        )
                    )
                ),
                "generationConfig", Map.of(
                    "temperature", 0.7,
                    "maxOutputTokens", 700
                )
            )
        );

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(GEMINI_API_URL + geminiApiKey))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new BadRequestException("Gemini API loi HTTP " + response.statusCode() + ": " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
        if (textNode.isMissingNode() || textNode.asText().isBlank()) {
            throw new BadRequestException("Khong doc duoc noi dung tra loi tu Gemini");
        }

        return textNode.asText().trim();
    }

    private String buildGeminiPrompt(String message, List<ChatMessageDTO> history, String productContext) {
        StringBuilder builder = new StringBuilder();
        builder.append(SYSTEM_PROMPT).append("\n\n");
        builder.append(productContext).append("\n");
        builder.append("Lich su hoi thoai:\n");

        if (history != null) {
            for (ChatMessageDTO item : history) {
                if (item == null || item.getContent() == null || item.getContent().isBlank()) {
                    continue;
                }
                String role = "assistant".equalsIgnoreCase(item.getRole()) ? "Luna" : "Khach";
                builder.append(role).append(": ").append(item.getContent().trim()).append("\n");
            }
        }

        builder.append("Khach: ").append(message).append("\n");
        builder.append("Luna:");
        return builder.toString();
    }

    private List<ProductChatSuggestionDTO> suggestProducts(String message, List<ChatMessageDTO> history) {
        String combinedText = buildCombinedText(message, history);
        List<String> keywords = extractKeywords(combinedText);
        BigDecimal budget = extractBudget(combinedText);

        List<Product> products = productRepository.findByIsActiveTrue();
        return products.stream()
            .sorted(Comparator.comparingInt(product -> -scoreProduct(product, keywords, budget)))
            .limit(6)
            .map(this::toSuggestionDTO)
            .toList();
    }

    private String buildCombinedText(String message, List<ChatMessageDTO> history) {
        StringBuilder builder = new StringBuilder();
        if (history != null) {
            for (ChatMessageDTO item : history) {
                if (item != null && item.getContent() != null) {
                    builder.append(' ').append(item.getContent());
                }
            }
        }
        builder.append(' ').append(message);
        return normalize(builder.toString());
    }

    private List<String> extractKeywords(String text) {
        String[] rawWords = text.split("\\s+");
        Set<String> words = new HashSet<>();
        for (String rawWord : rawWords) {
            String word = rawWord.replaceAll("[^a-z0-9]", "");
            if (word.length() >= 2) {
                words.add(word);
            }
        }
        return new ArrayList<>(words);
    }

    private BigDecimal extractBudget(String text) {
        String[] words = text.split("\\s+");
        for (int i = 0; i < words.length; i++) {
            String current = words[i].replaceAll("[^0-9]", "");
            if (current.isBlank()) {
                continue;
            }
            try {
                long value = Long.parseLong(current);
                if (i + 1 < words.length) {
                    String next = words[i + 1];
                    if (next.contains("trieu")) {
                        return BigDecimal.valueOf(value).multiply(BigDecimal.valueOf(1_000_000L));
                    }
                    if (next.contains("k")) {
                        return BigDecimal.valueOf(value).multiply(BigDecimal.valueOf(1_000L));
                    }
                }
                if (value >= 100000) {
                    return BigDecimal.valueOf(value);
                }
            } catch (NumberFormatException ignored) {
            }
        }
        return null;
    }

    private int scoreProduct(Product product, List<String> keywords, BigDecimal budget) {
        int score = 0;
        String haystack = normalize(
            safe(product.getName()) + " " +
            safe(product.getDescription()) + " " +
            safe(product.getColor()) + " " +
            safe(product.getSizes()) + " " +
            safe(product.getTag()) + " " +
            safe(product.getCategory() != null ? product.getCategory().getName() : null) + " " +
            safe(product.getBrand() != null ? product.getBrand().getName() : null)
        );

        for (String keyword : keywords) {
            if (haystack.contains(keyword)) {
                score += 8;
            }
        }

        if (product.getIsFeatured() != null && product.getIsFeatured()) {
            score += 5;
        }
        if (product.getReviews() != null) {
            score += Math.min(product.getReviews(), 20);
        }
        if (product.getRating() != null) {
            score += (int) Math.round(product.getRating() * 2);
        }
        if (product.getStockQuantity() != null && product.getStockQuantity() > 0) {
            score += 6;
        }

        if (budget != null && product.getPrice() != null) {
            if (product.getPrice().compareTo(budget) <= 0) {
                score += 12;
            } else {
                score -= 6;
            }
        }

        return score;
    }

    private ProductChatSuggestionDTO toSuggestionDTO(Product product) {
        ProductChatSuggestionDTO dto = new ProductChatSuggestionDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setCategory(product.getCategory() != null ? product.getCategory().getName() : null);
        dto.setBrand(product.getBrand() != null ? product.getBrand().getName() : null);
        dto.setColor(product.getColor());
        dto.setSizes(product.getSizes());
        dto.setPrice(product.getPrice());
        dto.setOriginalPrice(product.getOriginalPrice());
        dto.setDiscountPercentage(product.getDiscountPercentage());
        dto.setImage(product.getImage());
        dto.setRating(product.getRating());
        dto.setReviews(product.getReviews());
        dto.setTag(product.getTag());
        return dto;
    }

    private String buildProductContext(List<ProductChatSuggestionDTO> suggestions) {
        StringBuilder builder = new StringBuilder();
        builder.append("Du lieu san pham lien quan lay tu database:\n");

        if (suggestions == null || suggestions.isEmpty()) {
            builder.append("- Hien tai khong co san pham phu hop de goi y.\n");
            return builder.toString();
        }

        for (ProductChatSuggestionDTO item : suggestions) {
            builder.append("- ID: ").append(item.getId()).append('\n');
            builder.append("  Ten: ").append(safe(item.getName())).append('\n');
            builder.append("  Thuong hieu: ").append(safe(item.getBrand())).append('\n');
            builder.append("  Loai: ").append(safe(item.getCategory())).append('\n');
            builder.append("  Mau: ").append(safe(item.getColor())).append('\n');
            builder.append("  Size: ").append(safe(item.getSizes())).append('\n');
            builder.append("  Gia: ").append(item.getPrice() != null ? item.getPrice() : "").append('\n');
            builder.append("  Gia goc: ").append(item.getOriginalPrice() != null ? item.getOriginalPrice() : "").append('\n');
            builder.append("  Giam gia (%): ").append(item.getDiscountPercentage() != null ? item.getDiscountPercentage() : "").append('\n');
            builder.append("  Rating: ").append(item.getRating() != null ? item.getRating() : "").append('\n');
            builder.append("  So review: ").append(item.getReviews() != null ? item.getReviews() : "").append('\n');
            builder.append("  Tag: ").append(safe(item.getTag())).append('\n');
            builder.append("  Link san pham: /product/").append(item.getId()).append('\n');
        }

        return builder.toString();
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        return Normalizer.normalize(value, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "")
            .toLowerCase(Locale.ROOT);
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}

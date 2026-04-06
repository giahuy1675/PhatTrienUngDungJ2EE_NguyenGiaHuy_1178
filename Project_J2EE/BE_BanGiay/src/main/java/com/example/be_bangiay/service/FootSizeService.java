package com.example.be_bangiay.service;

import com.example.be_bangiay.dto.FootSizeResult;
import com.example.be_bangiay.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class FootSizeService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private static final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    private static final String PROMPT =
        "Bạn là chuyên gia đo size giày. Phân tích ảnh bàn chân và ước lượng size giày phù hợp.\\n\\n" +
        "CÁCH PHÂN TÍCH:\\n" +
        "1. Tìm tờ giấy A4 trong ảnh (29.7cm x 21cm) làm vật tham chiếu.\\n" +
        "2. So sánh tỷ lệ chiều dài bàn chân với cạnh dài A4 (29.7cm) để tính chiều dài chân (cm).\\n" +
        "3. Tương tự tính chiều rộng chân.\\n" +
        "4. Nếu không thấy A4, ước lượng dựa trên tỷ lệ hình học bàn chân.\\n" +
        "5. Tra bảng quy đổi:\\n" +
        "   22.5cm=EU36/US4.5, 23cm=EU36.5/US5, 23.5cm=EU37/US5.5,\\n" +
        "   24cm=EU38/US6, 24.5cm=EU38.5/US6.5, 25cm=EU39/US7,\\n" +
        "   25.5cm=EU40/US7.5, 26cm=EU40.5/US8, 26.5cm=EU41/US8.5,\\n" +
        "   27cm=EU42/US9, 27.5cm=EU42.5/US9.5, 28cm=EU43/US10,\\n" +
        "   28.5cm=EU44/US10.5, 29cm=EU44.5/US11, 29.5cm=EU45/US11.5,\\n" +
        "   30cm=EU46/US12\\n" +
        "6. Xác định loại chân: Bình thường / Rộng / Hẹp.\\n\\n" +
        "Trả lời ĐÚNG JSON, KHÔNG markdown:\\n" +
        "{\\\"thanhCong\\\":true,\\\"sizeEU\\\":\\\"42\\\",\\\"sizeUS\\\":\\\"9\\\",\\\"sizeUK\\\":\\\"8\\\",\\\"sizeVN\\\":\\\"27\\\",\\\"chieuDaiCm\\\":\\\"27.0\\\",\\\"chieuRongCm\\\":\\\"10.2\\\",\\\"loaiChan\\\":\\\"Bình thường\\\",\\\"lyDo\\\":\\\"...\\\",\\\"loiKhuyen\\\":\\\"...\\\"}\\n\\n" +
        "Nếu ảnh không hợp lệ:\\n" +
        "{\\\"thanhCong\\\":false,\\\"loi\\\":\\\"Lý do...\\\"}";

    /**
     * Nhận file ảnh dạng byte[], gọi hàm phân tích và trả kết quả
     */
    public FootSizeResult phanTichAnhChan(byte[] imageBytes, String contentType) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new BadRequestException("Chưa cấu hình API key. Liên hệ admin.");
        }

        try {
            // Chuyển ảnh sang base64
            String base64 = Base64.getEncoder().encodeToString(imageBytes);
            
            // Xử lý MIME type cho Gemini (thường là image/jpeg, image/png, image/webp)
            String mimeType = contentType;
            if (mimeType == null || !mimeType.startsWith("image/")) {
                mimeType = "image/jpeg"; // default fallback
            }

            // Tạo JSON body
            String body = buildRequestBody(base64, mimeType);

            // Gọi API
            String response = goiAPI(body);

            // Lấy nội dung text
            String aiContent = layNoiDung(response);

            // Parse thành FootSizeResult
            return parseKetQua(aiContent);

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            FootSizeResult loi = new FootSizeResult();
            loi.setThanhCong(false);
            loi.setLoi("Lỗi xử lý API: " + e.getMessage());
            return loi;
        }
    }

    private String buildRequestBody(String base64Image, String mimeType) {
        return "{" +
            "  \"contents\": [" +
            "    {" +
            "      \"parts\": [" +
            "        {" +
            "          \"text\": \"" + PROMPT + "\"" +
            "        }," +
            "        {" +
            "          \"inline_data\": {" +
            "            \"mime_type\": \"" + mimeType + "\"," +
            "            \"data\": \"" + base64Image + "\"" +
            "          }" +
            "        }" +
            "      ]" +
            "    }" +
            "  ]," +
            "  \"generationConfig\": {" +
            "    \"temperature\": 0.2" +
            "  }" +
            "}";
    }

    // Gọi HTTP POST, trả về response body
    private String goiAPI(String requestBody) throws Exception {
        URL url = new URL(API_URL + apiKey);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        try {
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            conn.setDoOutput(true);
            conn.setConnectTimeout(30000);
            conn.setReadTimeout(60000);

            try (OutputStream os = conn.getOutputStream()) {
                os.write(requestBody.getBytes(StandardCharsets.UTF_8));
            }

            int code = conn.getResponseCode();
            BufferedReader reader = new BufferedReader(new InputStreamReader(
                code >= 200 && code < 300 ? conn.getInputStream() : conn.getErrorStream(),
                StandardCharsets.UTF_8
            ));

            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
            reader.close();

            if (code < 200 || code >= 300) {
                throw new BadRequestException("API lỗi HTTP " + code + ": " + sb);
            }
            return sb.toString();

        } finally {
            conn.disconnect();
        }
    }

    // Trích text từ response JSON
    private String layNoiDung(String json) throws Exception {
        String key = "\"text\":";
        int start = json.indexOf(key);
        if (start == -1) throw new Exception("Không tìm thấy text trong response");

        start += key.length();
        while (start < json.length() && json.charAt(start) == ' ') start++;
        if (json.charAt(start) != '"') throw new Exception("Format lỗi: thiếu dấu ngoặc kép bọc chuỗi text");

        start++;
        StringBuilder content = new StringBuilder();
        boolean escaped = false;

        for (int i = start; i < json.length(); i++) {
            char c = json.charAt(i);
            if (escaped) {
                if (c == 'n') content.append('\n');
                else if (c == '"') content.append('"');
                else if (c == '\\') content.append('\\');
                else content.append(c);
                escaped = false;
            } else if (c == '\\') {
                escaped = true;
            } else if (c == '"') {
                break;
            } else {
                content.append(c);
            }
        }
        return content.toString().trim();
    }

    // Parse nội dung JSON thành FootSizeResult
    private FootSizeResult parseKetQua(String text) {
        FootSizeResult rs = new FootSizeResult();

        // Loại bỏ markdown (vd: ```json ... ```) nếu có
        String json = text.trim();
        if (json.startsWith("```")) {
            int s = json.indexOf("{");
            int e = json.lastIndexOf("}");
            if (s != -1 && e != -1) json = json.substring(s, e + 1);
        }

        rs.setThanhCong(jsonBool(json, "thanhCong"));

        if (rs.isThanhCong()) {
            rs.setSizeEU(jsonStr(json, "sizeEU"));
            rs.setSizeUS(jsonStr(json, "sizeUS"));
            rs.setSizeUK(jsonStr(json, "sizeUK"));
            rs.setSizeVN(jsonStr(json, "sizeVN"));
            rs.setChieuDaiCm(jsonStr(json, "chieuDaiCm"));
            rs.setChieuRongCm(jsonStr(json, "chieuRongCm"));
            rs.setLoaiChan(jsonStr(json, "loaiChan"));
            rs.setLyDo(jsonStr(json, "lyDo"));
            rs.setLoiKhuyen(jsonStr(json, "loiKhuyen"));
        } else {
            String loi = jsonStr(json, "loi");
            if (loi == null) loi = jsonStr(json, "lyDo");
            rs.setLoi(loi != null ? loi : "Không thể phân tích ảnh");
        }
        return rs;
    }

    // Hàm tiện ích: lấy giá trị string từ JSON đơn giản
    private String jsonStr(String json, String key) {
        String search = "\"" + key + "\"";
        int idx = json.indexOf(search);
        if (idx == -1) return null;

        int colon = json.indexOf(":", idx + search.length());
        if (colon == -1) return null;

        int valStart = json.indexOf("\"", colon + 1);
        if (valStart == -1) return null;

        int valEnd = valStart + 1;
        boolean esc = false;
        while (valEnd < json.length()) {
            char c = json.charAt(valEnd);
            if (esc) esc = false;
            else if (c == '\\') esc = true;
            else if (c == '"') break;
            valEnd++;
        }
        return json.substring(valStart + 1, valEnd);
    }

    private boolean jsonBool(String json, String key) {
        String search = "\"" + key + "\"";
        int idx = json.indexOf(search);
        if (idx == -1) return false;
        int colon = json.indexOf(":", idx + search.length());
        if (colon == -1) return false;
        return json.substring(colon + 1).trim().startsWith("true");
    }
}

package com.example.be_bangiay.controller;

import com.example.be_bangiay.dto.AdminProductRequest;
import com.example.be_bangiay.dto.AdminReviewResponse;
import com.example.be_bangiay.dto.ProductReviewResponse;
import com.example.be_bangiay.entity.Brand;
import com.example.be_bangiay.entity.Category;
import com.example.be_bangiay.entity.Product;
import com.example.be_bangiay.entity.Order;
import com.example.be_bangiay.entity.User;
import com.example.be_bangiay.repository.BrandRepository;
import com.example.be_bangiay.repository.CategoryRepository;
import com.example.be_bangiay.repository.OrderRepository;
import com.example.be_bangiay.repository.ProductRepository;
import com.example.be_bangiay.repository.UserRepository;
import com.example.be_bangiay.repository.CartItemRepository;
import com.example.be_bangiay.service.ProductReviewService;
import com.example.be_bangiay.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5500", "http://127.0.0.1:5173", "http://127.0.0.1:5500"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductReviewService productReviewService;
    private final UserService userService;
    
    // Category Management
    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(categoryRepository.save(category));
    }
    
    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        return categoryRepository.findById(id)
            .map(existing -> {
                existing.setName(category.getName());
                existing.setDescription(category.getDescription());
                existing.setImageUrl(category.getImageUrl());
                existing.setIsActive(category.getIsActive());
                return ResponseEntity.ok(categoryRepository.save(existing));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
    
    // Product Management
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProductsForAdmin() {
        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            applyDiscountPricing(product);
        }
        productRepository.saveAll(products);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductByIdForAdmin(@PathVariable Long id) {
        return productRepository.findById(id)
            .map(product -> {
                applyDiscountPricing(product);
                productRepository.save(product);
                return ResponseEntity.ok(product);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody AdminProductRequest request) {
        try {
            Product product = new Product();
            product.setName(request.getName());
            product.setDescription(request.getDescription());
            product.setPrice(request.getPrice());
            product.setOriginalPrice(request.getOriginalPrice());
            product.setDiscountPercentage(request.getDiscountPercentage());
            product.setDiscountStartAt(request.getDiscountStartAt());
            product.setDiscountEndAt(request.getDiscountEndAt());
            product.setStockQuantity(request.getStockQuantity());
            product.setBrand(resolveBrand(request));
            product.setColor(request.getColor());
            product.setImage(request.getImage());
            product.setImages(request.getImages());
            product.setColors(request.getColors());
            product.setSizes(request.getSizes());
            product.setVariants(request.getVariants());
            product.setSpecs(request.getSpecs());
            product.setRating(request.getRating());
            product.setReviews(request.getReviews());
            product.setTag(request.getTag());
            product.setIsFeatured(request.getIsFeatured());
            product.setIsActive(request.getIsActive());
            product.setCategory(resolveCategory(request));
            
            applyDiscountPricing(product);
            Product saved = productRepository.save(product);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            System.err.println("Error creating product: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody AdminProductRequest request) {
        return productRepository.findById(id)
            .map(existing -> {
                existing.setName(request.getName());
                existing.setDescription(request.getDescription());
                existing.setPrice(request.getPrice());
                existing.setOriginalPrice(request.getOriginalPrice());
                existing.setDiscountPercentage(request.getDiscountPercentage());
                existing.setDiscountStartAt(request.getDiscountStartAt());
                existing.setDiscountEndAt(request.getDiscountEndAt());
                existing.setStockQuantity(request.getStockQuantity());
                existing.setBrand(resolveBrand(request));
                existing.setColor(request.getColor());
                existing.setImage(request.getImage());
                existing.setImages(request.getImages());
                existing.setColors(request.getColors());
                existing.setSizes(request.getSizes());
                existing.setVariants(request.getVariants());
                existing.setSpecs(request.getSpecs());
                existing.setRating(request.getRating());
                existing.setReviews(request.getReviews());
                existing.setTag(request.getTag());
                existing.setIsFeatured(request.getIsFeatured());
                existing.setIsActive(request.getIsActive());
                
                if (request.getCategory() != null) {
                    existing.setCategory(resolveCategory(request));
                }
                
                applyDiscountPricing(existing);
                return ResponseEntity.ok(productRepository.save(existing));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/products/discount")
    public ResponseEntity<Map<String, String>> applyBulkDiscount(@RequestBody Map<String, Object> payload) {
        Object idsObj = payload.get("productIds");
        Object discountObj = payload.get("discountPercentage");
        Object durationHoursObj = payload.get("durationHours");

        if (!(idsObj instanceof List<?> idsRaw) || discountObj == null || durationHoursObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Thiếu productIds, discountPercentage hoặc durationHours"));
        }

        BigDecimal discountPercentage;
        try {
            discountPercentage = new BigDecimal(discountObj.toString());
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "discountPercentage không hợp lệ"));
        }

        if (discountPercentage.compareTo(BigDecimal.ZERO) < 0 || discountPercentage.compareTo(new BigDecimal("100")) > 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "discountPercentage phải trong khoảng 0-100"));
        }

        long durationHours;
        try {
            durationHours = Long.parseLong(durationHoursObj.toString());
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "durationHours không hợp lệ"));
        }

        if (durationHours <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "durationHours phải > 0"));
        }

        List<Long> productIds = idsRaw.stream()
            .map(id -> Long.valueOf(id.toString()))
            .toList();

        LocalDateTime startAt = LocalDateTime.now();
        LocalDateTime endAt = startAt.plusHours(durationHours);

        List<Product> productsToUpdate = productRepository.findAllById(productIds);
        for (Product product : productsToUpdate) {
            product.setDiscountPercentage(discountPercentage);
            product.setDiscountStartAt(startAt);
            product.setDiscountEndAt(endAt);
            applyDiscountPricing(product);
        }
        productRepository.saveAll(productsToUpdate);

        return ResponseEntity.ok(Map.of("message", "Áp dụng giảm giá có thời hạn thành công"));
    }
    
    @DeleteMapping("/products/{id}")
    @Transactional
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            // Check if product has been ordered
            Product product = productRepository.findById(id).orElseThrow();
            if (product.getOrderDetails() != null && !product.getOrderDetails().isEmpty()) {
                // Product has been ordered, soft delete instead
                product.setIsActive(false);
                productRepository.save(product);
                return ResponseEntity.ok(Map.of(
                    "message", "Sản phẩm đã có trong đơn hàng, đã chuyển sang trạng thái không hoạt động thay vì xóa"
                ));
            }
            
            // Delete all cart items that reference this product first
            cartItemRepository.deleteByProductId(id);
            
            // Now delete the product
            productRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Xóa sản phẩm thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", "Không thể xóa sản phẩm: " + e.getMessage()
            ));
        }
    }
    
    // Order Management
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }
    
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
        @PathVariable Long id, 
        @RequestBody Map<String, String> body
    ) {
        String statusStr = body.get("status");
        if (statusStr == null) {
            return ResponseEntity.<Order>badRequest().build();
        }
        
        return (ResponseEntity<Order>) orderRepository.findById(id)
            .map(order -> {
                try {
                    Order.OrderStatus status = Order.OrderStatus.valueOf(statusStr);
                    order.setStatus(status);
                    return ResponseEntity.ok(orderRepository.save(order));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.<Order>badRequest().build();
                }
            })
            .orElseGet(() -> ResponseEntity.<Order>notFound().build());
    }
    
    // User Management
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return userRepository.findById(id)
            .map(existing -> {
                existing.setFullName(user.getFullName());
                existing.setEmail(user.getEmail());
                existing.setPhoneNumber(user.getPhoneNumber());
                existing.setAddress(user.getAddress());
                return ResponseEntity.ok(userRepository.save(existing));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PutMapping("/users/{id}/status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return userRepository.findById(id)
            .map(user -> {
                user.setIsActive(body.get("isActive"));
                return ResponseEntity.ok(userRepository.save(user));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userRepository.findById(id)
            .map(user -> {
                String role = body.get("role");
                if ("USER".equals(role) || "ADMIN".equals(role)) {
                    user.setRole(User.Role.valueOf(role));
                    return ResponseEntity.ok(userRepository.save(user));
                }
                return ResponseEntity.badRequest().<User>build();
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping("/users/{id}/orders")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long id) {
        return ResponseEntity.ok(orderRepository.findByUserId(id));
    }

    // Review Management
    @GetMapping("/reviews")
    public ResponseEntity<List<AdminReviewResponse>> getAllReviewsForAdmin() {
        return ResponseEntity.ok(productReviewService.getAllReviewsForAdmin());
    }

    @PostMapping("/reviews/{reviewId}/reply")
    public ResponseEntity<ProductReviewResponse> replyReviewAsAdmin(
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> body
    ) {
        String content = body.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String email = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User admin = userService.getUserByEmail(email);
        return ResponseEntity.ok(productReviewService.adminReplyToReview(reviewId, admin.getId(), content));
    }

    @PutMapping("/reviews/{reviewId}/active")
    public ResponseEntity<Void> toggleReviewActive(
            @PathVariable Long reviewId,
            @RequestBody Map<String, Boolean> body
    ) {
        Boolean isActive = body.get("isActive");
        if (isActive == null) {
            return ResponseEntity.badRequest().build();
        }

        productReviewService.toggleReviewActive(reviewId, isActive);
        return ResponseEntity.ok().build();
    }

    private Brand resolveBrand(AdminProductRequest request) {
        if (request.getBrand() == null || request.getBrand().getId() == null) {
            return null;
        }
        return brandRepository.findById(request.getBrand().getId())
            .orElseThrow(() -> new IllegalArgumentException("Brand không tồn tại: " + request.getBrand().getId()));
    }

    private Category resolveCategory(AdminProductRequest request) {
        if (request.getCategory() == null || request.getCategory().getId() == null) {
            throw new IllegalArgumentException("Category phải được chọn");
        }
        return categoryRepository.findById(request.getCategory().getId())
            .orElseThrow(() -> new IllegalArgumentException("Category không tồn tại: " + request.getCategory().getId()));
    }

    private void applyDiscountPricing(Product product) {
        BigDecimal original = product.getOriginalPrice();
        BigDecimal discount = product.getDiscountPercentage() == null ? BigDecimal.ZERO : product.getDiscountPercentage();

        if (original == null || original.compareTo(BigDecimal.ZERO) <= 0) {
            if (product.getPrice() != null && product.getPrice().compareTo(BigDecimal.ZERO) > 0) {
                product.setOriginalPrice(product.getPrice());
            }
            original = product.getOriginalPrice();
        }

        if (original == null || original.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime discountStartAt = product.getDiscountStartAt();
        LocalDateTime discountEndAt = product.getDiscountEndAt();

        boolean isDiscountActive = discount.compareTo(BigDecimal.ZERO) > 0
            && discountStartAt != null
            && discountEndAt != null
            && (now.isEqual(discountStartAt) || now.isAfter(discountStartAt))
            && now.isBefore(discountEndAt);

        if (!isDiscountActive) {
            product.setDiscountPercentage(BigDecimal.ZERO);
            product.setDiscountStartAt(null);
            product.setDiscountEndAt(null);
            product.setPrice(original);
            return;
        }

        if (discount.compareTo(new BigDecimal("100")) > 0) {
            discount = new BigDecimal("100");
        }

        product.setDiscountPercentage(discount);

        BigDecimal discountAmount = original.multiply(discount).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal discountedPrice = original.subtract(discountAmount);

        if (discountedPrice.compareTo(BigDecimal.ZERO) < 0) {
            discountedPrice = BigDecimal.ZERO;
        }

        product.setPrice(discountedPrice);
    }
}

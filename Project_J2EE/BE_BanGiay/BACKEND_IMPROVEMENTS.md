# Backend Improvements Checklist

## 🔴 CRITICAL - Cần sửa ngay

### 1. Security
- [ ] Implement JWT Authentication
- [ ] Add @PreAuthorize("hasRole('ADMIN')") cho admin endpoints
- [ ] Remove `.anyRequest().permitAll()`
- [ ] Add request rate limiting

### 2. CartItem Logic Bug
```java
// HIỆN TẠI (SAI):
CartItem existingItem = findByUserIdAndProductId(userId, productId);
if (exists) {
    existingItem.setQuantity(existingItem.getQuantity() + quantity); // SAI!
}

// PHẢI SỬA:
CartItem existingItem = findByUserIdAndProductIdAndSizeAndColor(
    userId, productId, selectedSize, selectedColor
);
// Chỉ cộng quantity nếu size + color GIỐNG NHAU
```

### 3. Validation
```java
// Entity cần thêm:
@NotNull(message = "Quantity không được null")
@Min(value = 1, message = "Quantity phải >= 1")
@Max(value = 999, message = "Quantity tối đa 999")
private Integer quantity;

@NotBlank(message = "Product name không được trống")
@Size(min = 3, max = 200, message = "Tên sản phẩm 3-200 ký tự")
private String name;

@Email(message = "Email không hợp lệ")
@Column(unique = true)
private String email;
```

### 4. Exception Handling
```java
// Tạo custom exceptions:
public class ResourceNotFoundException extends RuntimeException {}
public class BadRequestException extends RuntimeException {}
public class UnauthorizedException extends RuntimeException {}

// Tạo GlobalExceptionHandler:
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404).body(new ErrorResponse(ex.getMessage()));
    }
}
```

## 🟡 IMPORTANT - Nên sửa

### 5. Service Layer
```java
// Tạo CartService:
@Service
@RequiredArgsConstructor
public class CartService {
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    
    @Transactional
    public CartItem addToCart(Long userId, AddToCartRequest request) {
        // Business logic ở đây
    }
}

// Controller chỉ gọi service:
@PostMapping("/{userId}")
public ResponseEntity<CartItem> addToCart(@PathVariable Long userId, @RequestBody @Valid AddToCartRequest request) {
    return ResponseEntity.ok(cartService.addToCart(userId, request));
}
```

### 6. DTO Pattern
```java
// Request DTOs:
public class AddToCartRequest {
    @NotNull private Long productId;
    @Min(1) private Integer quantity;
    private String selectedSize;
    private String selectedColor;
}

// Response DTOs:
public class CartItemResponse {
    private Long id;
    private ProductResponse product;
    private Integer quantity;
    // Không expose User entity ra ngoài
}
```

### 7. Transaction Management
```java
@Service
public class OrderService {
    @Transactional(rollbackFor = Exception.class)
    public Order createOrder(CreateOrderRequest request) {
        // 1. Tạo order
        // 2. Tạo orderDetails
        // 3. Giảm stockQuantity
        // 4. Clear cart
        // Nếu bất kỳ bước nào lỗi → rollback TẤT CẢ
    }
}
```

### 8. Repository Custom Queries
```java
// CartItemRepository cần thêm:
@Query("SELECT c FROM CartItem c WHERE c.user.id = :userId " +
       "AND c.product.id = :productId " +
       "AND (:size IS NULL OR c.selectedSize = :size) " +
       "AND (:color IS NULL OR c.selectedColor = :color)")
Optional<CartItem> findByUserIdAndProductIdAndSizeAndColor(
    @Param("userId") Long userId,
    @Param("productId") Long productId,
    @Param("size") String size,
    @Param("color") String color
);
```

## 🟢 NICE TO HAVE - Cải thiện thêm

### 9. Logging
```java
@Slf4j // Lombok
@Service
public class CartService {
    public CartItem addToCart(Long userId, AddToCartRequest request) {
        log.info("Adding product {} to cart for user {}", request.getProductId(), userId);
        try {
            // logic
            log.info("Successfully added to cart: {}", cartItem.getId());
        } catch (Exception e) {
            log.error("Failed to add to cart", e);
            throw e;
        }
    }
}
```

### 10. Pagination
```java
// ProductController:
@GetMapping
public ResponseEntity<Page<Product>> getProducts(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    @RequestParam(defaultValue = "id") String sort
) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
    return ResponseEntity.ok(productRepository.findAll(pageable));
}
```

### 11. API Versioning
```java
@RestController
@RequestMapping("/api/v1/cart") // Thêm version
public class CartController {}
```

### 12. Image Storage
```java
// Thay vì lưu base64, upload lên cloud storage
@Service
public class ImageService {
    public String uploadImage(MultipartFile file) {
        // Upload to AWS S3, Cloudinary, etc.
        return "https://cdn.example.com/images/product-123.jpg";
    }
}
```

### 13. Caching
```java
@Service
public class ProductService {
    @Cacheable(value = "products", key = "#id")
    public Product getById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }
}
```

### 14. OpenAPI Documentation
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

## 📊 Priority Order

1. **CRITICAL**: Security (JWT) + CartItem Bug + Validation
2. **IMPORTANT**: Service Layer + Exception Handling + DTOs
3. **NICE TO HAVE**: Logging + Pagination + Caching

## 🎯 Mục tiêu sau khi sửa:

- ✅ Security: JWT authentication hoàn chỉnh
- ✅ Code quality: Service layer, DTOs, validation
- ✅ Reliability: Transaction, error handling, logging
- ✅ Performance: Caching, pagination
- ✅ Maintainability: Clean code, documentation

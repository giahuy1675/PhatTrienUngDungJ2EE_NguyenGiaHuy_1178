package com.example.be_bangiay.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "orderDetails"})
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(min = 3, max = 200, message = "Tên sản phẩm phải từ 3-200 ký tự")
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, precision = 15, scale = 2)
    @NotNull(message = "Giá không được null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải lớn hơn 0")
    @Digits(integer = 15, fraction = 2, message = "Giá không hợp lệ")
    private BigDecimal price;
    
    @Column(precision = 15, scale = 2)
    @DecimalMin(value = "0.0", message = "Giá gốc phải >= 0")
    private BigDecimal originalPrice;

    @Column(precision = 5, scale = 2)
    @DecimalMin(value = "0.0", message = "Phần trăm giảm giá phải >= 0")
    @DecimalMax(value = "100.0", message = "Phần trăm giảm giá phải <= 100")
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column
    private LocalDateTime discountStartAt;

    @Column
    private LocalDateTime discountEndAt;
    
    @Column(nullable = false)
    @NotNull(message = "Số lượng tồn kho không được null")
    @Min(value = 0, message = "Số lượng tồn kho phải >= 0")
    private Integer stockQuantity = 0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    @JsonIgnoreProperties({"products"})
    private Brand brand;
    
    @Column(length = 50)
    private String color;
    
    @Column(columnDefinition = "LONGTEXT")
    private String image; // Ảnh chính
    
    @Column(columnDefinition = "LONGTEXT")
    private String images; // JSON array: ["url1", "url2"]
    
    @Column(columnDefinition = "TEXT")
    private String colors; // JSON array: ["#000", "#FFF"]
    
    @Column(columnDefinition = "TEXT")
    private String sizes; // JSON array: ["38", "39", "40"]
    
    @Column(columnDefinition = "LONGTEXT")
    private String variants; // JSON array: [{"color": "#ff0000", "colorName": "Đỏ", "images": ["url1", "url2"], "stockQuantity": 10}]
    
    @Column(columnDefinition = "TEXT")
    private String specs; // JSON array: ["Đế cao su", "Lưới thoáng khí"]
    
    @Column
    private Double rating; // 4.5 stars
    
    @Column
    private Integer reviews = 0; // Số lượng đánh giá
    
    @Column(length = 50)
    private String tag; // "Bán chạy nhất", "Mới", "Giảm giá"
    
    @Column(nullable = false)
    private Boolean isFeatured = false;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnoreProperties({"products"})
    private Category category;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderDetail> orderDetails;
}

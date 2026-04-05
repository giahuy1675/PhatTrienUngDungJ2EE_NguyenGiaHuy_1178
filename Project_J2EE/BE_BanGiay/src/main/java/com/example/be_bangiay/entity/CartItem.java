package com.example.be_bangiay.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User không được null")
    private User user;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    @NotNull(message = "Product không được null")
    private Product product;
    
    @Column(nullable = false)
    @NotNull(message = "Số lượng không được null")
    @Min(value = 1, message = "Số lượng phải >= 1")
    @Max(value = 999, message = "Số lượng tối đa 999")
    private Integer quantity;
    
    @Column(name = "selected_size", length = 50)
    private String selectedSize;
    
    @Column(name = "selected_color", length = 50)
    private String selectedColor;
    
    @Column(name = "selected_image", columnDefinition = "LONGTEXT")
    private String selectedImage;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}

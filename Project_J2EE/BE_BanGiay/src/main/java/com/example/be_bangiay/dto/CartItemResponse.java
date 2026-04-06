package com.example.be_bangiay.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private BigDecimal productPrice;
    private String selectedSize;
    private String selectedColor;
    private String selectedImage;
    private Integer quantity;
    private BigDecimal subtotal;
    
    public CartItemResponse(Long id, Long productId, String productName, String productImage, 
                           BigDecimal productPrice, String selectedSize, String selectedColor, 
                           String selectedImage, Integer quantity) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productImage = productImage;
        this.productPrice = productPrice;
        this.selectedSize = selectedSize;
        this.selectedColor = selectedColor;
        this.selectedImage = selectedImage;
        this.quantity = quantity;
        this.subtotal = productPrice.multiply(BigDecimal.valueOf(quantity));
    }
}

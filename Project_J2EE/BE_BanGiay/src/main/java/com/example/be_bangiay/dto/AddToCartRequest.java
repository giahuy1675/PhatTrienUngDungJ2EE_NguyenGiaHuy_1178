package com.example.be_bangiay.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddToCartRequest {
    @NotNull(message = "Product ID không được null")
    private Long productId;
    
    @NotNull(message = "Số lượng không được null")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;
    
    private String selectedSize;
    private String selectedColor;
    private String selectedImage;
}

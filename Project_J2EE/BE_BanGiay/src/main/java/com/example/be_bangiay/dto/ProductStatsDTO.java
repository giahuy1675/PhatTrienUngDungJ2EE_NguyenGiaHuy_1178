package com.example.be_bangiay.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductStatsDTO {
    private Long productId;
    private String productName;
    private String productImage;
    private Integer stockQuantity;
    private Long totalSold;
    private Double revenue;
}

package com.example.be_bangiay.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AdminProductRequest {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private BigDecimal discountPercentage;
    private LocalDateTime discountStartAt;
    private LocalDateTime discountEndAt;
    private Integer stockQuantity;
    private BrandRef brand;
    private String color;
    private String image;
    private String images;
    private String colors;
    private String sizes;
    private String variants;
    private String specs;
    private Double rating;
    private Integer reviews;
    private String tag;
    private Boolean isFeatured;
    private Boolean isActive;
    private CategoryRef category;

    @Data
    @NoArgsConstructor
    public static class BrandRef {
        private Long id;
    }

    @Data
    @NoArgsConstructor
    public static class CategoryRef {
        private Long id;
    }
}

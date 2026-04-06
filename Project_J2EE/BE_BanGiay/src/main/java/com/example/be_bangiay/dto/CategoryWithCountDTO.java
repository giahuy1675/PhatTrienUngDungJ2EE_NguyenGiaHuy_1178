package com.example.be_bangiay.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryWithCountDTO {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer productCount;
    
    public CategoryWithCountDTO(Long id, String name, String description, String imageUrl, 
                                Boolean isActive, LocalDateTime createdAt, LocalDateTime updatedAt, 
                                Long productCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.productCount = productCount != null ? productCount.intValue() : 0;
    }
}

package com.example.be_bangiay.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminReviewResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Long orderId;
    private Long parentId;
    private Integer rating;
    private String content;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Author author;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Author {
        private Long id;
        private String fullName;
        private String email;
    }
}

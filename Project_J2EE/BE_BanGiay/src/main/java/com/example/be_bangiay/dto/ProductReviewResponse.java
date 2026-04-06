package com.example.be_bangiay.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductReviewResponse {
    private Long id;
    private Long productId;
    private Long orderId;
    private Long parentId;
    private Integer rating;
    private String content;
    private LocalDateTime createdAt;
    private Author author;
    private List<ProductReviewResponse> replies = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Author {
        private Long id;
        private String fullName;
        private String email;
    }
}

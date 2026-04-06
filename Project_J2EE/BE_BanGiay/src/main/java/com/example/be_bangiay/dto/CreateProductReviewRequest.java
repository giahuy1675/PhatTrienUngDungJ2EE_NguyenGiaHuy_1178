package com.example.be_bangiay.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateProductReviewRequest {
    private Long orderId;
    private Long parentId;

    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    private Integer rating;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;
}

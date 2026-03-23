package com.example.be_bangiay.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateOrderRequest {
    @NotBlank(message = "Tên người nhận không được trống")
    @Size(max = 100, message = "Tên người nhận không được vượt quá 100 ký tự")
    private String receiverName;
    
    @NotBlank(message = "Số điện thoại không được trống")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Số điện thoại không hợp lệ")
    private String receiverPhone;
    
    @NotBlank(message = "Địa chỉ không được trống")
    @Size(max = 500, message = "Địa chỉ không được vượt quá 500 ký tự")
    private String receiverAddress;
    
    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String note;
    
    @NotNull(message = "Danh sách sản phẩm không được null")
    @Size(min = 1, message = "Đơn hàng phải có ít nhất 1 sản phẩm")
    private List<OrderItemRequest> items;
    
    @NotNull(message = "Tổng tiền không được null")
    @DecimalMin(value = "0.0", message = "Tổng tiền phải lớn hơn 0")
    private BigDecimal totalAmount;

    // COD | VNPAY
    private String paymentMethod;
    
    @Data
    public static class OrderItemRequest {
        @NotNull(message = "Product ID không được null")
        private Long productId;
        
        @NotNull(message = "Số lượng không được null")
        @Min(value = 1, message = "Số lượng phải lớn hơn 0")
        private Integer quantity;
        
        @NotNull(message = "Giá không được null")
        @DecimalMin(value = "0.0", message = "Giá phải lớn hơn 0")
        private BigDecimal price;
        
        private String selectedSize;
        private String selectedColor;
        private String selectedImage;
    }
}

package com.example.be_bangiay.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerStatsDTO {
    private Long userId;
    private String email;
    private String fullName;
    private Long totalOrders;
    private BigDecimal totalSpent;
    private BigDecimal averageOrderValue;
}

package com.example.nguyengiahuybuoi_8.model;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartItem {
    private Long productId;
    private String productName;
    private BigDecimal price;
    private int quantity;
    private BigDecimal total;

    public CartItem() {}

    public CartItem(Long productId, String productName, BigDecimal price, int quantity) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
        this.total = price.multiply(BigDecimal.valueOf(quantity));
    }

    public void updateTotal() {
        this.total = price.multiply(BigDecimal.valueOf(quantity));
    }
}
package com.example.be_bangiay.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String orderNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"orders", "password"})
    private User user;
    
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal shippingFee = BigDecimal.ZERO;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;
    
    @Column(nullable = false, length = 200)
    @NotBlank(message = "Địa chỉ giao hàng không được trống")
    @Size(max = 200, message = "Địa chỉ không được vượt quá 200 ký tự")
    private String shippingAddress;
    
    @Column(nullable = false, length = 100)
    @NotBlank(message = "Tên người nhận không được trống")
    @Size(max = 100, message = "Tên người nhận không được vượt quá 100 ký tự")
    private String receiverName;
    
    @Column(nullable = false, length = 15)
    @NotBlank(message = "Số điện thoại không được trống")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Số điện thoại không hợp lệ")
    private String receiverPhone;
    
    @Column(columnDefinition = "TEXT")
    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String note;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private LocalDateTime deliveredAt;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"order"})
    private List<OrderDetail> orderDetails;
    
    public enum OrderStatus {
        PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED
    }
    
    @Column(length = 100)
    private String paymentReference;

    public enum PaymentMethod {
        COD, BANK_TRANSFER, CREDIT_CARD, E_WALLET, VNPAY
    }
    
    public enum PaymentStatus {
        UNPAID, PAID, REFUNDED
    }
}

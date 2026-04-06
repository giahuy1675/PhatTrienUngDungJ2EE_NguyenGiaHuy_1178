package com.example.be_bangiay.service;

import com.example.be_bangiay.dto.CreateOrderRequest;
import com.example.be_bangiay.entity.Order;
import com.example.be_bangiay.entity.OrderDetail;
import com.example.be_bangiay.entity.Product;
import com.example.be_bangiay.entity.User;
import com.example.be_bangiay.exception.BadRequestException;
import com.example.be_bangiay.exception.ResourceNotFoundException;
import com.example.be_bangiay.repository.OrderRepository;
import com.example.be_bangiay.repository.ProductRepository;
import com.example.be_bangiay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdWithDetails(userId);
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
    }

    public Optional<Order> getByPaymentReference(String paymentReference) {
        return orderRepository.findByPaymentReference(paymentReference);
    }

    @Transactional(rollbackFor = Exception.class)
    public Order createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber(generateOrderNumber());
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setShippingAddress(request.getReceiverAddress());
        order.setNote(request.getNote());
        order.setTotalAmount(request.getTotalAmount());
        order.setShippingFee(java.math.BigDecimal.ZERO);
        order.setDiscount(java.math.BigDecimal.ZERO);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.UNPAID);

        String paymentMethod = request.getPaymentMethod() == null ? "COD" : request.getPaymentMethod().toUpperCase();
        if ("VNPAY".equals(paymentMethod)) {
            // Dùng CREDIT_CARD để tương thích schema DB cũ (cột payment_method chưa có giá trị VNPAY)
            order.setPaymentMethod(Order.PaymentMethod.CREDIT_CARD);
            order.setPaymentReference("VNP" + System.currentTimeMillis());
        } else {
            order.setPaymentMethod(Order.PaymentMethod.COD);
        }

        List<OrderDetail> orderDetails = new ArrayList<>();
        for (CreateOrderRequest.OrderItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", item.getProductId()));

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException(String.format("Sản phẩm '%s' không đủ số lượng trong kho", product.getName()));
            }

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(item.getQuantity());
            detail.setPrice(item.getPrice());
            detail.setDiscount(java.math.BigDecimal.ZERO);
            detail.setSubtotal(item.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())));
            detail.setSelectedSize(item.getSelectedSize());
            detail.setSelectedColor(item.getSelectedColor());
            detail.setSelectedImage(item.getSelectedImage());
            orderDetails.add(detail);

            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        order.setOrderDetails(orderDetails);
        return orderRepository.save(order);
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Transactional
    public Order updatePaymentStatus(Long orderId, Order.PaymentStatus paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setPaymentStatus(paymentStatus);
        return orderRepository.save(order);
    }

    @Transactional
    public void markOrderPaidByReference(String paymentReference) {
        Order order = orderRepository.findByPaymentReference(paymentReference)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "paymentReference", paymentReference));
        order.setPaymentStatus(Order.PaymentStatus.PAID);
        if (order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
        }
        orderRepository.save(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new BadRequestException("Chỉ có thể hủy đơn hàng ở trạng thái chờ xử lý");
        }

        for (OrderDetail detail : order.getOrderDetails()) {
            Product product = detail.getProduct();
            product.setStockQuantity(product.getStockQuantity() + detail.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        long randomSuffix = (long) (Math.random() * 1000);
        return String.format("ORD%s%03d", timestamp, randomSuffix);
    }
}

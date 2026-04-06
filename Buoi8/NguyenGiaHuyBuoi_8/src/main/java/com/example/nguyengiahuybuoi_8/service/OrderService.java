package com.example.nguyengiahuybuoi_8.service;

import com.example.nguyengiahuybuoi_8.model.*;
import com.example.nguyengiahuybuoi_8.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    public Order createOrder(String username, List<CartItem> cartItems) {
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setOrderDetails(new ArrayList<>());

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            Product product = productService.getProductById(item.getProductId());
            if (product == null) {
                throw new RuntimeException("Product not found: " + item.getProductId());
            }

            OrderDetail detail = new OrderDetail();
            detail.setProduct(product);
            detail.setQuantity(item.getQuantity());
            detail.setPrice(item.getPrice());
            detail.setOrder(order);
            order.getOrderDetails().add(detail);
            total = total.add(item.getTotal());
        }
        order.setTotalAmount(total);

        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUser(String username) {
        User user = userService.findByUsername(username);
        return orderRepository.findByUserId(user.getId());
    }
}
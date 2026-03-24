package com.example.nguyengiahuybuoi_8.controller;

import com.example.nguyengiahuybuoi_8.model.CartItem;
import com.example.nguyengiahuybuoi_8.model.Order;
import com.example.nguyengiahuybuoi_8.service.OrderService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;

@Controller
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/checkout")
    public String checkout(HttpSession session, Model model) {
        List<CartItem> cart = (List<CartItem>) session.getAttribute("cart");
        if (cart == null || cart.isEmpty()) {
            return "redirect:/cart";
        }

        model.addAttribute("cart", cart);
        return "checkout";
    }

    @PostMapping("/checkout")
    public String processCheckout(Authentication authentication, HttpSession session, Model model) {
        List<CartItem> cart = (List<CartItem>) session.getAttribute("cart");
        if (cart == null || cart.isEmpty()) {
            return "redirect:/cart";
        }

        try {
            Order order = orderService.createOrder(authentication.getName(), cart);
            session.removeAttribute("cart"); // Clear cart after successful order
            model.addAttribute("order", order);
            return "order-success";
        } catch (Exception e) {
            model.addAttribute("error", "Failed to process order: " + e.getMessage());
            return "checkout";
        }
    }

    @GetMapping("/orders")
    public String viewOrders(Authentication authentication, Model model) {
        List<Order> orders = orderService.getOrdersByUser(authentication.getName());
        model.addAttribute("orders", orders);
        return "orders";
    }
}
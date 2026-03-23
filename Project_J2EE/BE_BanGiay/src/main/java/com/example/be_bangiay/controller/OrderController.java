package com.example.be_bangiay.controller;

import com.example.be_bangiay.dto.CreateOrderRequest;
import com.example.be_bangiay.entity.Order;
import com.example.be_bangiay.entity.User;
import com.example.be_bangiay.service.OrderService;
import com.example.be_bangiay.service.UserService;
import com.example.be_bangiay.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5500", "http://127.0.0.1:5173", "http://127.0.0.1:5500"})
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;
    private final VnpayService vnpayService;

    @Value("${vnpay.returnUrl}")
    private String vnpReturnUrl;

    @GetMapping
    public ResponseEntity<List<Order>> getCurrentUserOrders() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(orderService.getOrdersByUserId(user.getId()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Order> createOrder(
            @PathVariable Long userId,
            @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(userId, request));
    }

    @PostMapping("/{userId}/vnpay")
    public ResponseEntity<Map<String, String>> createVnpayPayment(
            @PathVariable Long userId,
            @Valid @RequestBody CreateOrderRequest request,
            HttpServletRequest httpServletRequest) {
        request.setPaymentMethod("VNPAY");
        Order order = orderService.createOrder(userId, request);
        String ipAddr = httpServletRequest.getRemoteAddr();
        String paymentUrl = vnpayService.createPaymentUrl(order, ipAddr, vnpReturnUrl);

        Map<String, String> response = new HashMap<>();
        response.put("paymentUrl", paymentUrl);
        response.put("orderId", String.valueOf(order.getId()));
        response.put("paymentReference", order.getPaymentReference());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<Map<String, Object>> vnpayReturn(@RequestParam Map<String, String> params) {
        Map<String, Object> result = new HashMap<>();

        boolean validSignature = vnpayService.validateSignature(params);
        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");

        if (!validSignature || txnRef == null) {
            result.put("success", false);
            result.put("message", "Chữ ký không hợp lệ");
            return ResponseEntity.badRequest().body(result);
        }

        if ("00".equals(responseCode)) {
            orderService.markOrderPaidByReference(txnRef);
            result.put("success", true);
            result.put("message", "Thanh toán thành công");
        } else {
            result.put("success", false);
            result.put("message", "Thanh toán thất bại hoặc bị hủy");
        }

        result.put("txnRef", txnRef);
        result.put("responseCode", responseCode);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(@RequestParam Map<String, String> params) {
        Map<String, String> response = new HashMap<>();

        boolean validSignature = vnpayService.validateSignature(params);
        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");

        if (!validSignature || txnRef == null) {
            response.put("RspCode", "97");
            response.put("Message", "Invalid signature");
            return ResponseEntity.ok(response);
        }

        if ("00".equals(responseCode)) {
            orderService.markOrderPaidByReference(txnRef);
        }

        response.put("RspCode", "00");
        response.put("Message", "Confirm Success");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.ok().build();
    }
}

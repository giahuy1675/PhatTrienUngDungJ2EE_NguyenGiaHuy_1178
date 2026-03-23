package com.example.be_bangiay.controller;

import com.example.be_bangiay.dto.AddToCartRequest;
import com.example.be_bangiay.dto.CartItemResponse;
import com.example.be_bangiay.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5500", "http://127.0.0.1:5173", "http://127.0.0.1:5500"})
@RequiredArgsConstructor
public class CartController {
    
    private final CartService cartService;
    
    @GetMapping("/{userId}")
    public ResponseEntity<List<CartItemResponse>> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getCartByUserId(userId));
    }
    
    @PostMapping("/{userId}")
    public ResponseEntity<CartItemResponse> addToCart(
        @PathVariable Long userId,
        @Valid @RequestBody AddToCartRequest request
    ) {
        return ResponseEntity.ok(cartService.addToCart(userId, request));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CartItemResponse> updateCartItem(
        @PathVariable Long id,
        @RequestBody Map<String, Integer> payload
    ) {
        return ResponseEntity.ok(cartService.updateCartItem(id, payload.get("quantity")));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long id) {
        cartService.removeCartItem(id);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<Void> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok().build();
    }
}

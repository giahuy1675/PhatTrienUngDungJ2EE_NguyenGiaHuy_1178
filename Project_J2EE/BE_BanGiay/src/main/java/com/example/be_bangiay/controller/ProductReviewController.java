package com.example.be_bangiay.controller;

import com.example.be_bangiay.dto.CanReviewResponse;
import com.example.be_bangiay.dto.CreateProductReviewRequest;
import com.example.be_bangiay.dto.ProductReviewResponse;
import com.example.be_bangiay.entity.User;
import com.example.be_bangiay.service.ProductReviewService;
import com.example.be_bangiay.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5500", "http://127.0.0.1:5173", "http://127.0.0.1:5500"})
@RequiredArgsConstructor
public class ProductReviewController {

    private final ProductReviewService productReviewService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<ProductReviewResponse>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(productReviewService.getProductReviews(productId));
    }

    @GetMapping("/can-review")
    public ResponseEntity<CanReviewResponse> canReview(@PathVariable Long productId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);

        boolean canReview = productReviewService.canUserReview(productId, user.getId());
        List<Long> unreviewedOrderIds = productReviewService.getUnreviewedOrderIds(productId, user.getId());
        return ResponseEntity.ok(new CanReviewResponse(canReview, unreviewedOrderIds));
    }

    @PostMapping
    public ResponseEntity<ProductReviewResponse> createReview(
            @PathVariable Long productId,
            @Valid @RequestBody CreateProductReviewRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);

        return ResponseEntity.ok(productReviewService.createReview(productId, user.getId(), request));
    }
}

package com.example.be_bangiay.service;

import com.example.be_bangiay.dto.AdminReviewResponse;
import com.example.be_bangiay.dto.CreateProductReviewRequest;
import com.example.be_bangiay.dto.ProductReviewResponse;
import com.example.be_bangiay.entity.Order;
import com.example.be_bangiay.entity.Product;
import com.example.be_bangiay.entity.ProductReview;
import com.example.be_bangiay.entity.User;
import com.example.be_bangiay.exception.BadRequestException;
import com.example.be_bangiay.exception.ResourceNotFoundException;
import com.example.be_bangiay.repository.OrderDetailRepository;
import com.example.be_bangiay.repository.OrderRepository;
import com.example.be_bangiay.repository.ProductRepository;
import com.example.be_bangiay.repository.ProductReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductReviewService {

    private final ProductReviewRepository productReviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;

    public boolean canUserReview(Long productId, Long userId) {
        return orderDetailRepository.existsDeliveredOrderForProduct(
                userId,
                productId,
                Order.OrderStatus.DELIVERED
        );
    }

    public List<Long> getUnreviewedOrderIds(Long productId, Long userId) {
        // Nếu đã đánh giá sản phẩm này rồi thì không cho đánh giá nữa
        if (productReviewRepository.existsByProductIdAndUserIdAndParentReviewIsNullAndIsActiveTrue(productId, userId)) {
            return List.of();
        }
        return orderDetailRepository.findUnreviewedDeliveredOrderIds(
                userId,
                productId,
                Order.OrderStatus.DELIVERED
        );
    }

    public List<ProductReviewResponse> getProductReviews(Long productId) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        List<ProductReview> reviews = productReviewRepository.findByProductIdWithUser(productId);

        Map<Long, ProductReviewResponse> mapped = new LinkedHashMap<>();
        List<ProductReviewResponse> roots = new ArrayList<>();

        for (ProductReview review : reviews) {
            ProductReviewResponse response = toResponse(review);
            mapped.put(review.getId(), response);
        }

        for (ProductReview review : reviews) {
            ProductReviewResponse response = mapped.get(review.getId());
            if (review.getParentReview() != null) {
                ProductReviewResponse parent = mapped.get(review.getParentReview().getId());
                if (parent != null) {
                    parent.getReplies().add(response);
                }
            } else {
                roots.add(response);
            }
        }

        return roots;
    }

    @Transactional
    public ProductReviewResponse createReview(Long productId, Long userId, CreateProductReviewRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        User user = new User();
        user.setId(userId);

        ProductReview parent = null;
        if (request.getParentId() != null) {
            parent = productReviewRepository.findByIdAndIsActiveTrue(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductReview", "id", request.getParentId()));

            if (!parent.getProduct().getId().equals(productId)) {
                throw new BadRequestException("Reply không thuộc sản phẩm này");
            }
        }

        if (parent == null) {
            if (!canUserReview(productId, userId)) {
                throw new BadRequestException("Bạn chỉ có thể đánh giá sản phẩm đã mua và đã giao");
            }

            if (request.getOrderId() == null) {
                throw new BadRequestException("Đánh giá cần gắn với đơn hàng");
            }

            if (productReviewRepository.existsByProductIdAndUserIdAndParentReviewIsNullAndIsActiveTrue(
                    productId,
                    userId
            )) {
                throw new BadRequestException("Bạn đã đánh giá sản phẩm này rồi");
            }

            if (request.getRating() == null) {
                throw new BadRequestException("Đánh giá gốc cần có số sao");
            }
        }

        if (parent != null && request.getRating() == null) {
            request.setRating(parent.getRating());
        }

        Order order = null;
        if (request.getOrderId() != null) {
            order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId()));

            if (!order.getUser().getId().equals(userId)) {
                throw new BadRequestException("Đơn hàng không thuộc về bạn");
            }
        }

        ProductReview review = new ProductReview();
        review.setProduct(product);
        review.setUser(user);
        review.setOrder(order);
        review.setParentReview(parent);
        review.setRating(request.getRating());
        review.setContent(request.getContent().trim());
        review.setIsActive(true);

        ProductReview saved = productReviewRepository.save(review);
        recalculateProductRating(productId);

        return toResponse(saved);
    }

    public List<AdminReviewResponse> getAllReviewsForAdmin() {
        return productReviewRepository.findAllForAdmin().stream()
                .map(this::toAdminResponse)
                .toList();
    }

    @Transactional
    public ProductReviewResponse adminReplyToReview(Long reviewId, Long adminUserId, String content) {
        ProductReview parent = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductReview", "id", reviewId));

        if (parent.getParentReview() != null) {
            throw new BadRequestException("Chỉ được phản hồi vào đánh giá gốc");
        }

        if (!Boolean.TRUE.equals(parent.getIsActive())) {
            throw new BadRequestException("Không thể phản hồi đánh giá đã ẩn");
        }

        User admin = new User();
        admin.setId(adminUserId);

        ProductReview reply = new ProductReview();
        reply.setProduct(parent.getProduct());
        reply.setUser(admin);
        reply.setOrder(parent.getOrder());
        reply.setParentReview(parent);
        reply.setRating(parent.getRating());
        reply.setContent(content.trim());
        reply.setIsActive(true);

        ProductReview saved = productReviewRepository.save(reply);
        return toResponse(saved);
    }

    @Transactional
    public void toggleReviewActive(Long reviewId, boolean isActive) {
        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductReview", "id", reviewId));

        review.setIsActive(isActive);
        productReviewRepository.save(review);

        if (review.getParentReview() == null) {
            recalculateProductRating(review.getProduct().getId());
        }
    }

    private void recalculateProductRating(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Double avgRating = productReviewRepository.findAverageRatingByProductId(productId);
        Long totalRatings = productReviewRepository.countRatingsByProductId(productId);

        product.setRating(avgRating == null ? 0D : Math.round(avgRating * 10.0) / 10.0);
        product.setReviews(totalRatings == null ? 0 : totalRatings.intValue());

        productRepository.save(product);
    }

    private ProductReviewResponse toResponse(ProductReview review) {
        ProductReviewResponse.Author author = new ProductReviewResponse.Author(
                review.getUser().getId(),
                review.getUser().getFullName(),
                review.getUser().getEmail()
        );

        return new ProductReviewResponse(
                review.getId(),
                review.getProduct().getId(),
                review.getOrder() != null ? review.getOrder().getId() : null,
                review.getParentReview() != null ? review.getParentReview().getId() : null,
                review.getRating(),
                review.getContent(),
                review.getCreatedAt(),
                author,
                new ArrayList<>()
        );
    }

    private AdminReviewResponse toAdminResponse(ProductReview review) {
        AdminReviewResponse.Author author = new AdminReviewResponse.Author(
                review.getUser().getId(),
                review.getUser().getFullName(),
                review.getUser().getEmail()
        );

        return new AdminReviewResponse(
                review.getId(),
                review.getProduct().getId(),
                review.getProduct().getName(),
                review.getOrder() != null ? review.getOrder().getId() : null,
                review.getParentReview() != null ? review.getParentReview().getId() : null,
                review.getRating(),
                review.getContent(),
                review.getIsActive(),
                review.getCreatedAt(),
                author
        );
    }
}

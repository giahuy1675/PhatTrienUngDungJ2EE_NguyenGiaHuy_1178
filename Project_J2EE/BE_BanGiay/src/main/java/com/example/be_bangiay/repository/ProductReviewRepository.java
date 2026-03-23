package com.example.be_bangiay.repository;

import com.example.be_bangiay.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    boolean existsByProductIdAndUserIdAndParentReviewIsNullAndIsActiveTrue(Long productId, Long userId);

    boolean existsByProductIdAndUserIdAndOrderIdAndParentReviewIsNullAndIsActiveTrue(Long productId, Long userId, Long orderId);

    @Query("SELECT pr FROM ProductReview pr " +
           "LEFT JOIN FETCH pr.user " +
           "LEFT JOIN FETCH pr.parentReview " +
           "WHERE pr.product.id = :productId AND pr.isActive = true " +
           "ORDER BY pr.createdAt DESC")
    List<ProductReview> findByProductIdWithUser(@Param("productId") Long productId);

    Optional<ProductReview> findByIdAndIsActiveTrue(Long id);

    @Query("SELECT AVG(pr.rating) FROM ProductReview pr WHERE pr.product.id = :productId AND pr.isActive = true AND pr.parentReview IS NULL AND pr.rating IS NOT NULL")
    Double findAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(pr) FROM ProductReview pr WHERE pr.product.id = :productId AND pr.isActive = true AND pr.parentReview IS NULL AND pr.rating IS NOT NULL")
    Long countRatingsByProductId(@Param("productId") Long productId);

    @Query("SELECT pr FROM ProductReview pr " +
           "LEFT JOIN FETCH pr.user " +
           "LEFT JOIN FETCH pr.product " +
           "LEFT JOIN FETCH pr.parentReview " +
           "LEFT JOIN FETCH pr.order " +
           "ORDER BY pr.createdAt DESC")
    List<ProductReview> findAllForAdmin();
}

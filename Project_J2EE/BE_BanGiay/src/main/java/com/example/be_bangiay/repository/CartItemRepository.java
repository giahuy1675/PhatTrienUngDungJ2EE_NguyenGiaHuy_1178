package com.example.be_bangiay.repository;

import com.example.be_bangiay.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    List<CartItem> findByUserId(Long userId);
    
    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);
    
    @Query("SELECT c FROM CartItem c WHERE c.user.id = :userId " +
           "AND c.product.id = :productId " +
           "AND ((:size IS NULL AND c.selectedSize IS NULL) OR c.selectedSize = :size) " +
           "AND ((:color IS NULL AND c.selectedColor IS NULL) OR c.selectedColor = :color)")
    Optional<CartItem> findByUserIdAndProductIdAndSizeAndColor(
        @Param("userId") Long userId,
        @Param("productId") Long productId,
        @Param("size") String size,
        @Param("color") String color
    );
    
    @Transactional
    @Modifying
    void deleteByUserId(Long userId);
    
    @Transactional
    @Modifying
    void deleteByProductId(Long productId);
}

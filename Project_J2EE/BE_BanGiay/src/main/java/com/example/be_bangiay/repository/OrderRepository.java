package com.example.be_bangiay.repository;

import com.example.be_bangiay.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderDetails od LEFT JOIN FETCH od.product WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findByUserIdWithDetails(@Param("userId") Long userId);

    List<Order> findByOrderNumber(String orderNumber);

    Optional<Order> findByPaymentReference(String paymentReference);

    // Statistics queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt < :endDate")
    Long countOrdersByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt < :endDate AND o.paymentStatus = 'PAID'")
    BigDecimal sumRevenueByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(od.quantity), 0) FROM OrderDetail od WHERE od.order.createdAt >= :startDate AND od.order.createdAt < :endDate")
    Long sumProductsSoldByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(DISTINCT o.user) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt < :endDate")
    Long countNewCustomersByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}

package com.example.be_bangiay.repository;

import com.example.be_bangiay.entity.Order;
import com.example.be_bangiay.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    
    // Top 10 sản phẩm bán chạy nhất
    @Query("SELECT od.product.id as productId, od.product.name as productName, od.product.image as productImage, " +
           "od.product.stockQuantity as stockQuantity, SUM(od.quantity) as totalSold, SUM(od.subtotal) as revenue " +
           "FROM OrderDetail od " +
           "GROUP BY od.product.id, od.product.name, od.product.image, od.product.stockQuantity " +
           "ORDER BY SUM(od.quantity) DESC")
    List<Object[]> findTopSellingProducts(@Param("limit") int limit);
    
    // Sản phẩm theo product ID với tổng bán
    @Query("SELECT od.product.id, od.product.name, od.product.image, od.product.stockQuantity, " +
           "SUM(od.quantity), SUM(od.subtotal) " +
           "FROM OrderDetail od " +
           "GROUP BY od.product.id, od.product.name, od.product.image, od.product.stockQuantity " +
           "ORDER BY SUM(od.quantity) DESC")
    List<Object[]> findAllProductStats();

    @Query("SELECT CASE WHEN COUNT(od) > 0 THEN true ELSE false END FROM OrderDetail od " +
           "WHERE od.order.user.id = :userId " +
           "AND od.product.id = :productId " +
           "AND od.order.status = :status")
    boolean existsDeliveredOrderForProduct(@Param("userId") Long userId,
                                           @Param("productId") Long productId,
                                           @Param("status") Order.OrderStatus status);
}

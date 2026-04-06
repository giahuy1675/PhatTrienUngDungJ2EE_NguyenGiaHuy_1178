package com.example.be_bangiay.repository;

import com.example.be_bangiay.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);

    Optional<User> findByPhoneNumber(String phoneNumber);

    Optional<User> findByEmailOrPhoneNumber(String email, String phoneNumber);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    boolean existsByEmailOrPhoneNumber(String email, String phoneNumber);
    
    // Statistics queries
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startDate AND u.createdAt < :endDate")
    Long countNewUsersByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Top customers by order count and total spent
    @Query("SELECT u.id, u.email, u.fullName, COUNT(o), SUM(o.totalAmount), AVG(o.totalAmount) " +
           "FROM User u JOIN u.orders o " +
           "WHERE o.paymentStatus = 'PAID' " +
           "GROUP BY u.id, u.email, u.fullName " +
           "ORDER BY SUM(o.totalAmount) DESC")
    List<Object[]> findTopCustomers();
}

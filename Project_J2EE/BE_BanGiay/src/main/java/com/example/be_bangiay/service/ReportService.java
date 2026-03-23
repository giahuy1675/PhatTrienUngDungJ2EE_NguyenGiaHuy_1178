package com.example.be_bangiay.service;

import com.example.be_bangiay.dto.CustomerStatsDTO;
import com.example.be_bangiay.dto.DashboardStatsDTO;
import com.example.be_bangiay.dto.ProductStatsDTO;
import com.example.be_bangiay.entity.Product;
import com.example.be_bangiay.repository.OrderDetailRepository;
import com.example.be_bangiay.repository.OrderRepository;
import com.example.be_bangiay.repository.ProductRepository;
import com.example.be_bangiay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    
    /**
     * Get dashboard statistics
     */
    public DashboardStatsDTO getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        
        // Today
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfToday = now.toLocalDate().atTime(LocalTime.MAX);
        
        // This week (Monday to Sunday)
        LocalDateTime startOfWeek = now.toLocalDate().minusDays(now.getDayOfWeek().getValue() - 1).atStartOfDay();
        LocalDateTime endOfWeek = startOfWeek.plusDays(7);
        
        // This month
        LocalDateTime startOfMonth = now.toLocalDate().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1);
        
        BigDecimal todayRevenue = orderRepository.sumRevenueByDateRange(startOfToday, endOfToday);
        BigDecimal weekRevenue = orderRepository.sumRevenueByDateRange(startOfWeek, endOfWeek);
        BigDecimal monthRevenue = orderRepository.sumRevenueByDateRange(startOfMonth, endOfMonth);
        
        Long newOrdersCount = orderRepository.countOrdersByDateRange(startOfToday, endOfToday);
        Long totalProductsSold = orderRepository.sumProductsSoldByDateRange(startOfMonth, endOfMonth);
        Long newCustomersCount = userRepository.countNewUsersByDateRange(startOfMonth, endOfMonth);
        
        return new DashboardStatsDTO(
            todayRevenue != null ? todayRevenue : BigDecimal.ZERO,
            weekRevenue != null ? weekRevenue : BigDecimal.ZERO,
            monthRevenue != null ? monthRevenue : BigDecimal.ZERO,
            newOrdersCount != null ? newOrdersCount : 0L,
            totalProductsSold != null ? totalProductsSold : 0L,
            newCustomersCount != null ? newCustomersCount : 0L
        );
    }
    
    /**
     * Get top 10 best-selling products
     */
    public List<ProductStatsDTO> getTopSellingProducts(int limit) {
        List<Object[]> results = orderDetailRepository.findAllProductStats();
        
        return results.stream()
            .limit(limit)
            .map(row -> new ProductStatsDTO(
                ((Number) row[0]).longValue(),  // productId
                (String) row[1],                 // productName
                (String) row[2],                 // productImage
                ((Number) row[3]).intValue(),    // stockQuantity
                ((Number) row[4]).longValue(),   // totalSold
                ((Number) row[5]).doubleValue()  // revenue
            ))
            .collect(Collectors.toList());
    }
    
    /**
     * Get products with low stock (< 10)
     */
    public List<ProductStatsDTO> getLowStockProducts() {
        List<Product> products = productRepository.findAll();
        List<Object[]> statsResults = orderDetailRepository.findAllProductStats();
        
        // Map stats to products
        return products.stream()
            .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() < 10)
            .map(product -> {
                // Find stats for this product
                Object[] stat = statsResults.stream()
                    .filter(row -> ((Number) row[0]).longValue() == product.getId())
                    .findFirst()
                    .orElse(null);
                
                Long totalSold = 0L;
                Double revenue = 0.0;
                
                if (stat != null) {
                    totalSold = ((Number) stat[4]).longValue();
                    revenue = ((Number) stat[5]).doubleValue();
                }
                
                return new ProductStatsDTO(
                    product.getId(),
                    product.getName(),
                    product.getImage(),
                    product.getStockQuantity(),
                    totalSold,
                    revenue
                );
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get products with high stock (potential slow-moving)
     */
    public List<ProductStatsDTO> getHighStockProducts(int threshold) {
        List<Product> products = productRepository.findAll();
        List<Object[]> statsResults = orderDetailRepository.findAllProductStats();
        
        return products.stream()
            .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() > threshold)
            .map(product -> {
                // Find stats for this product
                Object[] stat = statsResults.stream()
                    .filter(row -> ((Number) row[0]).longValue() == product.getId())
                    .findFirst()
                    .orElse(null);
                
                Long totalSold = 0L;
                Double revenue = 0.0;
                
                if (stat != null) {
                    totalSold = ((Number) stat[4]).longValue();
                    revenue = ((Number) stat[5]).doubleValue();
                }
                
                return new ProductStatsDTO(
                    product.getId(),
                    product.getName(),
                    product.getImage(),
                    product.getStockQuantity(),
                    totalSold,
                    revenue
                );
            })
            .sorted((a, b) -> b.getStockQuantity().compareTo(a.getStockQuantity()))
            .collect(Collectors.toList());
    }
    
    /**
     * Get all product statistics
     */
    public List<ProductStatsDTO> getAllProductStats() {
        List<Object[]> results = orderDetailRepository.findAllProductStats();
        
        return results.stream()
            .map(row -> new ProductStatsDTO(
                ((Number) row[0]).longValue(),  // productId
                (String) row[1],                 // productName
                (String) row[2],                 // productImage
                ((Number) row[3]).intValue(),    // stockQuantity
                ((Number) row[4]).longValue(),   // totalSold
                ((Number) row[5]).doubleValue()  // revenue
            ))
            .collect(Collectors.toList());
    }
    
    /**
     * Get top 10 customers by total spending
     */
    public List<CustomerStatsDTO> getTopCustomers(int limit) {
        List<Object[]> results = userRepository.findTopCustomers();

        return results.stream()
            .limit(limit)
            .map(row -> {
                BigDecimal totalSpent = row[4] == null
                    ? BigDecimal.ZERO
                    : BigDecimal.valueOf(((Number) row[4]).doubleValue());

                BigDecimal averageOrderValue = row[5] == null
                    ? BigDecimal.ZERO
                    : BigDecimal.valueOf(((Number) row[5]).doubleValue()).setScale(2, RoundingMode.HALF_UP);

                return new CustomerStatsDTO(
                    ((Number) row[0]).longValue(),                    // userId
                    (String) row[1],                                  // email
                    (String) row[2],                                  // fullName
                    ((Number) row[3]).longValue(),                    // totalOrders
                    totalSpent,
                    averageOrderValue
                );
            })
            .collect(Collectors.toList());
    }
}

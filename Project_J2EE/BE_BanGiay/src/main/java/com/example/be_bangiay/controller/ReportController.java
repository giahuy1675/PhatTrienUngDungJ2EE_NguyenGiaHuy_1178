package com.example.be_bangiay.controller;

import com.example.be_bangiay.dto.CustomerStatsDTO;
import com.example.be_bangiay.dto.DashboardStatsDTO;
import com.example.be_bangiay.dto.ProductStatsDTO;
import com.example.be_bangiay.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {
    
    private final ReportService reportService;
    
    /**
     * GET /api/admin/reports/dashboard
     * Get dashboard overview statistics
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        DashboardStatsDTO stats = reportService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * GET /api/admin/reports/products/top-selling?limit=10
     * Get top selling products
     */
    @GetMapping("/products/top-selling")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductStatsDTO>> getTopSellingProducts(
            @RequestParam(defaultValue = "10") int limit) {
        List<ProductStatsDTO> products = reportService.getTopSellingProducts(limit);
        return ResponseEntity.ok(products);
    }
    
    /**
     * GET /api/admin/reports/products/low-stock
     * Get products with low stock (< 10)
     */
    @GetMapping("/products/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductStatsDTO>> getLowStockProducts() {
        List<ProductStatsDTO> products = reportService.getLowStockProducts();
        return ResponseEntity.ok(products);
    }
    
    /**
     * GET /api/admin/reports/products/high-stock?threshold=100
     * Get products with high stock (potential slow-moving)
     */
    @GetMapping("/products/high-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductStatsDTO>> getHighStockProducts(
            @RequestParam(defaultValue = "100") int threshold) {
        List<ProductStatsDTO> products = reportService.getHighStockProducts(threshold);
        return ResponseEntity.ok(products);
    }
    
    /**
     * GET /api/admin/reports/products/all-stats
     * Get all product statistics
     */
    @GetMapping("/products/all-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductStatsDTO>> getAllProductStats() {
        List<ProductStatsDTO> products = reportService.getAllProductStats();
        return ResponseEntity.ok(products);
    }
    
    /**
     * GET /api/admin/reports/customers/top?limit=10
     * Get top customers by total spending
     */
    @GetMapping("/customers/top")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CustomerStatsDTO>> getTopCustomers(
            @RequestParam(defaultValue = "10") int limit) {
        List<CustomerStatsDTO> customers = reportService.getTopCustomers(limit);
        return ResponseEntity.ok(customers);
    }
}

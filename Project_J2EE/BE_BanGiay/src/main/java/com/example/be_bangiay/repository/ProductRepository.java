package com.example.be_bangiay.repository;

import com.example.be_bangiay.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByIsActiveTrue();
    
    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);
    
    List<Product> findByBrandIdAndIsActiveTrue(Long brandId);
    
    List<Product> findByIsFeaturedTrueAndIsActiveTrue();
}

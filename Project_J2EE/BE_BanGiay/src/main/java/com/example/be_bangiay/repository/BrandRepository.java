package com.example.be_bangiay.repository;

import com.example.be_bangiay.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    
    List<Brand> findAllByIsActiveTrue();
    
    Optional<Brand> findByName(String name);
    
    boolean existsByName(String name);
}

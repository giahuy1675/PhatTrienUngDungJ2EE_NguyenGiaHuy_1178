package com.example.be_bangiay.controller;

import com.example.be_bangiay.entity.Brand;
import com.example.be_bangiay.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/brands")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5500", "http://127.0.0.1:5173", "http://127.0.0.1:5500"})
@RequiredArgsConstructor
public class BrandController {
    
    private final BrandRepository brandRepository;
    
    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        return ResponseEntity.ok(brandRepository.findAllByIsActiveTrue());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Brand> getBrandById(@PathVariable Long id) {
        return brandRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    // Admin endpoints
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllBrandsAdmin() {
        List<Brand> brands = brandRepository.findAll();
        List<Map<String, Object>> brandsWithCount = brands.stream()
            .map(brand -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", brand.getId());
                map.put("name", brand.getName());
                map.put("description", brand.getDescription());
                map.put("logo", brand.getLogo());
                map.put("isActive", brand.getIsActive());
                map.put("createdAt", brand.getCreatedAt());
                map.put("updatedAt", brand.getUpdatedAt());
                map.put("productCount", brand.getProducts() != null ? brand.getProducts().size() : 0);
                return map;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(brandsWithCount);
    }
    
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Brand> createBrand(@RequestBody Brand brand) {
        brand.setCreatedAt(LocalDateTime.now());
        brand.setUpdatedAt(LocalDateTime.now());
        brand.setIsActive(true);
        return ResponseEntity.ok(brandRepository.save(brand));
    }
    
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Brand> updateBrand(@PathVariable Long id, @RequestBody Brand brandDetails) {
        return brandRepository.findById(id)
            .map(brand -> {
                brand.setName(brandDetails.getName());
                brand.setDescription(brandDetails.getDescription());
                brand.setLogo(brandDetails.getLogo());
                brand.setIsActive(brandDetails.getIsActive());
                brand.setUpdatedAt(LocalDateTime.now());
                return ResponseEntity.ok(brandRepository.save(brand));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        return brandRepository.findById(id)
            .map(brand -> {
                brandRepository.delete(brand);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}

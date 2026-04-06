package com.example.be_bangiay.controller;

import com.example.be_bangiay.entity.Category;
import com.example.be_bangiay.repository.CategoryRepository;
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
@RequestMapping("/api/categories")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5500", "http://127.0.0.1:5173", "http://127.0.0.1:5500"})
@RequiredArgsConstructor
public class CategoryController {
    
    private final CategoryRepository categoryRepository;
    
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findByIsActiveTrue());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    // Admin endpoints
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllCategoriesAdmin() {
        List<Category> categories = categoryRepository.findAll();
        List<Map<String, Object>> categoriesWithCount = categories.stream()
            .map(category -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", category.getId());
                map.put("name", category.getName());
                map.put("description", category.getDescription());
                map.put("imageUrl", category.getImageUrl());
                map.put("isActive", category.getIsActive());
                map.put("createdAt", category.getCreatedAt());
                map.put("updatedAt", category.getUpdatedAt());
                map.put("productCount", category.getProducts() != null ? category.getProducts().size() : 0);
                return map;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(categoriesWithCount);
    }
    
    @PostMapping("/admin")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());
        category.setIsActive(true);
        return ResponseEntity.ok(categoryRepository.save(category));
    }
    
    @PutMapping("/admin/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category categoryDetails) {
        return categoryRepository.findById(id)
            .map(category -> {
                category.setName(categoryDetails.getName());
                category.setDescription(categoryDetails.getDescription());
                category.setIsActive(categoryDetails.getIsActive());
                category.setUpdatedAt(LocalDateTime.now());
                return ResponseEntity.ok(categoryRepository.save(category));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        return categoryRepository.findById(id)
            .map(category -> {
                categoryRepository.delete(category);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}

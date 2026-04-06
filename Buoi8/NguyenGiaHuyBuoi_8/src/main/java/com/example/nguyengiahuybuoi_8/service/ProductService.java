package com.example.nguyengiahuybuoi_8.service;

import com.example.nguyengiahuybuoi_8.model.Product;
import com.example.nguyengiahuybuoi_8.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Page<Product> getProducts(String keyword, Long categoryId, String sort, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, getSort(sort));
        if (keyword != null && !keyword.isEmpty() && categoryId != null) {
            return getSortedProducts(keyword, categoryId, sort, pageable);
        } else if (keyword != null && !keyword.isEmpty()) {
            return getSortedProducts(keyword, sort, pageable);
        } else if (categoryId != null) {
            return getSortedProducts(categoryId, sort, pageable);
        } else {
            return getSortedProducts(sort, pageable);
        }
    }

    private Page<Product> getSortedProducts(String sort, Pageable pageable) {
        if ("price_asc".equals(sort)) {
            return productRepository.findAllByOrderByPriceAsc(pageable);
        } else if ("price_desc".equals(sort)) {
            return productRepository.findAllByOrderByPriceDesc(pageable);
        } else {
            return productRepository.findAll(pageable);
        }
    }

    private Page<Product> getSortedProducts(String keyword, String sort, Pageable pageable) {
        if ("price_asc".equals(sort)) {
            return productRepository.findByNameContainingIgnoreCaseOrderByPriceAsc(keyword, pageable);
        } else if ("price_desc".equals(sort)) {
            return productRepository.findByNameContainingIgnoreCaseOrderByPriceDesc(keyword, pageable);
        } else {
            return productRepository.findByNameContainingIgnoreCase(keyword, pageable);
        }
    }

    private Page<Product> getSortedProducts(Long categoryId, String sort, Pageable pageable) {
        if ("price_asc".equals(sort)) {
            return productRepository.findByCategoryIdOrderByPriceAsc(categoryId, pageable);
        } else if ("price_desc".equals(sort)) {
            return productRepository.findByCategoryIdOrderByPriceDesc(categoryId, pageable);
        } else {
            return productRepository.findByCategoryId(categoryId, pageable);
        }
    }

    private Page<Product> getSortedProducts(String keyword, Long categoryId, String sort, Pageable pageable) {
        if ("price_asc".equals(sort)) {
            return productRepository.findByNameContainingIgnoreCaseAndCategoryIdOrderByPriceAsc(keyword, categoryId, pageable);
        } else if ("price_desc".equals(sort)) {
            return productRepository.findByNameContainingIgnoreCaseAndCategoryIdOrderByPriceDesc(keyword, categoryId, pageable);
        } else {
            return productRepository.findByNameContainingIgnoreCaseAndCategoryId(keyword, categoryId, pageable);
        }
    }

    private Sort getSort(String sort) {
        if ("price_asc".equals(sort)) {
            return Sort.by("price").ascending();
        } else if ("price_desc".equals(sort)) {
            return Sort.by("price").descending();
        } else {
            return Sort.by("id").ascending();
        }
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
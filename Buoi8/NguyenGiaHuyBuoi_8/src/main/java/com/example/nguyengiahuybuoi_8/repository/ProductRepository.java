package com.example.nguyengiahuybuoi_8.repository;

import com.example.nguyengiahuybuoi_8.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Tìm kiếm theo tên
    Page<Product> findByNameContainingIgnoreCase(String keyword, Pageable pageable);

    // Lọc theo category
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    // Tìm kiếm và lọc kết hợp
    Page<Product> findByNameContainingIgnoreCaseAndCategoryId(String keyword, Long categoryId, Pageable pageable);

    // Sắp xếp theo giá tăng dần
    Page<Product> findAllByOrderByPriceAsc(Pageable pageable);

    // Sắp xếp theo giá giảm dần
    Page<Product> findAllByOrderByPriceDesc(Pageable pageable);

    // Lọc và sắp xếp
    Page<Product> findByCategoryIdOrderByPriceAsc(Long categoryId, Pageable pageable);
    Page<Product> findByCategoryIdOrderByPriceDesc(Long categoryId, Pageable pageable);

    // Tìm kiếm và sắp xếp
    Page<Product> findByNameContainingIgnoreCaseOrderByPriceAsc(String keyword, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCaseOrderByPriceDesc(String keyword, Pageable pageable);

    // Tìm kiếm, lọc và sắp xếp
    Page<Product> findByNameContainingIgnoreCaseAndCategoryIdOrderByPriceAsc(String keyword, Long categoryId, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCaseAndCategoryIdOrderByPriceDesc(String keyword, Long categoryId, Pageable pageable);
}
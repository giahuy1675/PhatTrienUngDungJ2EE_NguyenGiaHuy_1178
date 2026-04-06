package com.example.nguyengiahuybuoi_8.repository;

import com.example.nguyengiahuybuoi_8.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
}
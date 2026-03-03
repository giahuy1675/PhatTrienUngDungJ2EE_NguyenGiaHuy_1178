package com.example.quanlysanpham_j2ee.service;

import com.example.quanlysanpham_j2ee.model.Category;
import com.example.quanlysanpham_j2ee.model.Product;
import com.example.quanlysanpham_j2ee.repository.CategoryRepository;
import com.example.quanlysanpham_j2ee.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public Category get(int id) {
        return categoryRepository.findById(id).orElse(null);
    }

    public void add(Category newCategory) {
        categoryRepository.save(newCategory);
    }

    public void update(Category editCategory) {
        if (categoryRepository.existsById(editCategory.getId())) {
            categoryRepository.save(editCategory);
        }
    }

    public void delete(int id) {
        // Set category = null cho tất cả sản phẩm thuộc danh mục này
        List<Product> products = productRepository.findByCategoryId(id);
        for (Product p : products) {
            p.setCategory(null);
        }
        productRepository.saveAll(products);
        categoryRepository.deleteById(id);
    }
}

package com.example.quanlysanpham_j2ee.service;

import com.example.quanlysanpham_j2ee.model.Category;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class CategoryService {
    private List<Category> categories = new ArrayList<>();

    public CategoryService() {
        categories.add(new Category(1, "Điện thoại"));
        categories.add(new Category(2, "Laptop"));
    }

    public List<Category> getAll() {
        return categories;
    }

    public Category get(int id) {
        return categories.stream().filter(c -> c.getId() == id).findFirst().orElse(null);
    }

    public void add(Category newCategory) {
        int maxId = categories.stream().mapToInt(Category::getId).max().orElse(0);
        newCategory.setId(maxId + 1);
        categories.add(newCategory);
    }

    public void update(Category editCategory) {
        Category find = get(editCategory.getId());
        if (find != null) {
            find.setName(editCategory.getName());
        }
    }

    public void delete(int id) {
        categories.removeIf(c -> c.getId() == id);
    }
}

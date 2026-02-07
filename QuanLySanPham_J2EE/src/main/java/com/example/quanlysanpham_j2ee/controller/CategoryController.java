package com.example.quanlysanpham_j2ee.controller;

import com.example.quanlysanpham_j2ee.service.CategoryService;
import com.example.quanlysanpham_j2ee.model.Category;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/categories")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping("")
    public String index(Model model) {
        model.addAttribute("categories", categoryService.getAll());
        model.addAttribute("category", new Category());
        return "category/categories";
    }

    @PostMapping("/add")
    public String add(@ModelAttribute("category") @Valid Category category, BindingResult result, Model model) {
        if (result.hasErrors()) {
            model.addAttribute("categories", categoryService.getAll());
            return "category/categories";
        }
        categoryService.add(category);
        return "redirect:/categories";
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable int id, Model model) {
        Category cat = categoryService.get(id);
        if (cat == null) return "redirect:/categories";
        model.addAttribute("category", cat);
        model.addAttribute("categories", categoryService.getAll());
        model.addAttribute("editMode", true);
        return "category/categories";
    }

    @PostMapping("/edit")
    public String edit(@ModelAttribute("category") @Valid Category category, BindingResult result, Model model) {
        if (result.hasErrors()) {
            model.addAttribute("categories", categoryService.getAll());
            model.addAttribute("editMode", true);
            return "category/categories";
        }
        categoryService.update(category);
        return "redirect:/categories";
    }

    @GetMapping("/delete/{id}")
    public String delete(@PathVariable int id) {
        categoryService.delete(id);
        return "redirect:/categories";
    }
}

package com.example.quanlysanpham_j2ee.controller;

import com.example.quanlysanpham_j2ee.model.Product;
import com.example.quanlysanpham_j2ee.service.ProductService;
import com.example.quanlysanpham_j2ee.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

@Controller
@RequestMapping("/products")
public class ProductController {
    @Autowired
    private ProductService productService;
    @Autowired
    private CategoryService categoryService;

    @GetMapping("")
    public String Index(Model model) {
        model.addAttribute("listProduct", productService.getAll());
        return "product/products";
    }

    @GetMapping("/create")
    public String Create(Model model) {
        model.addAttribute("product", new Product());
        model.addAttribute("categories", categoryService.getAll());
        return "product/create";
    }

    @PostMapping("/create")
    public String Create(@Valid Product newProduct, BindingResult result,
                        @RequestParam("category.id") int categoryId,
                        @RequestParam("imageProduct") MultipartFile imageProduct,
                        Model model) {
        if (result.hasErrors()) {
            model.addAttribute("categories", categoryService.getAll());
            return "product/create";
        }
        productService.updateImage(newProduct, imageProduct);
        newProduct.setCategory(categoryService.get(categoryId));
        productService.add(newProduct);
        return "redirect:/products";
    }

    @GetMapping("/edit/{id}")
    public String Edit(@PathVariable int id, Model model) {
        Product find = productService.get(id);
        if (find == null) {
            return "redirect:/products";
        }
        model.addAttribute("product", find);
        model.addAttribute("categories", categoryService.getAll());
        return "product/edit";
    }

    @PostMapping("/edit")
    public String Edit(@Valid Product editProduct, BindingResult result,
                      @RequestParam("category.id") int categoryId,
                      @RequestParam("imageProduct") MultipartFile imageProduct,
                      Model model) {
        if (result.hasErrors()) {
            model.addAttribute("categories", categoryService.getAll());
            return "product/edit";
        }
        if (editProduct != null && !imageProduct.isEmpty()) {
            productService.updateImage(editProduct, imageProduct);
        }
        editProduct.setCategory(categoryService.get(categoryId));
        productService.update(editProduct);
        return "redirect:/products";
    }
}

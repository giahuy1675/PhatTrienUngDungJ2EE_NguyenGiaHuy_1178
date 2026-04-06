package com.example.nguyengiahuybuoi_8.controller;

import com.example.nguyengiahuybuoi_8.model.Category;
import com.example.nguyengiahuybuoi_8.model.Product;
import com.example.nguyengiahuybuoi_8.service.CategoryService;
import com.example.nguyengiahuybuoi_8.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @GetMapping("/products")
    public String listProducts(@RequestParam(defaultValue = "0") int page, Model model) {
        Page<Product> productPage = productService.getProducts(null, null, null, page, 10);
        model.addAttribute("products", productPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", productPage.getTotalPages());
        return "admin/products";
    }

    @GetMapping("/products/add")
    public String addProductForm(Model model) {
        model.addAttribute("product", new Product());
        model.addAttribute("categories", categoryService.getAllCategories());
        return "admin/product-form";
    }

    @PostMapping("/products/save")
    public String saveProduct(@ModelAttribute Product product, @RequestParam("imageFile") MultipartFile imageFile, @RequestParam("categoryId") Long categoryId) {
        // Set the category from categoryId
        if (categoryId != null) {
            Category category = categoryService.getCategoryById(categoryId);
            if (category != null) {
                product.setCategory(category);
            }
        }

        // If editing an existing product, preserve the old image if no new image is uploaded
        if (product.getId() != null && imageFile.isEmpty()) {
            Product existingProduct = productService.getProductById(product.getId());
            if (existingProduct != null) {
                product.setImageName(existingProduct.getImageName());
            }
        }

        if (!imageFile.isEmpty()) {
            try {
                // Create images directory if it doesn't exist
                Path imagesDir = Paths.get("src/main/resources/static/images");
                Files.createDirectories(imagesDir);

                // Generate unique filename
                String originalFilename = imageFile.getOriginalFilename();
                String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
                String filename = UUID.randomUUID().toString() + extension;

                // Save file
                Path filePath = imagesDir.resolve(filename);
                Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // Set image name in product
                product.setImageName(filename);
            } catch (IOException e) {
                // Handle error - for now, just continue without image
                e.printStackTrace();
            }
        }

        productService.saveProduct(product);
        return "redirect:/admin/products";
    }

    @GetMapping("/products/edit/{id}")
    public String editProductForm(@PathVariable Long id, Model model) {
        Product product = productService.getProductById(id);
        if (product == null) {
            return "redirect:/admin/products";
        }
        model.addAttribute("product", product);
        model.addAttribute("categories", categoryService.getAllCategories());
        return "admin/product-form";
    }

    @GetMapping("/products/delete/{id}")
    public String deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return "redirect:/admin/products";
    }

    @GetMapping("/categories")
    public String listCategories(Model model) {
        model.addAttribute("categories", categoryService.getAllCategories());
        return "admin/categories";
    }

    @GetMapping("/categories/add")
    public String addCategoryForm(Model model) {
        model.addAttribute("category", new Category());
        return "admin/category-form";
    }

    @PostMapping("/categories/save")
    public String saveCategory(@ModelAttribute Category category) {
        categoryService.saveCategory(category);
        return "redirect:/admin/categories";
    }

    @GetMapping("/categories/edit/{id}")
    public String editCategoryForm(@PathVariable Long id, Model model) {
        Category category = categoryService.getCategoryById(id);
        if (category == null) {
            return "redirect:/admin/categories";
        }
        model.addAttribute("category", category);
        return "admin/category-form";
    }

    @GetMapping("/categories/delete/{id}")
    public String deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return "redirect:/admin/categories";
    }

    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("src/main/resources/static/images").resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG) // or determine from file extension
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
package com.example.quanlysanpham_j2ee.service;

import com.example.quanlysanpham_j2ee.model.Product;
import com.example.quanlysanpham_j2ee.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Product get(int id) {
        return productRepository.findById(id).orElse(null);
    }

    public void add(Product newProduct) {
        productRepository.save(newProduct);
    }

    public void update(Product editProduct) {
        if (productRepository.existsById(editProduct.getId())) {
            productRepository.save(editProduct);
        }
    }

    public void delete(int id) {
        productRepository.deleteById(id);
    }

    public void updateImage(Product product, MultipartFile imageProduct) {
        if (imageProduct == null || imageProduct.isEmpty()) {
            return;
        }
        String contentType = imageProduct.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Tệp tải lên không phải là hình ảnh!");
        }
        try {
            Path dirImages = Paths.get("static/images");
            if (!Files.exists(dirImages)) {
                Files.createDirectories(dirImages);
            }
            String newFileName = UUID.randomUUID() + "_" + imageProduct.getOriginalFilename();
            Path pathFileUpload = dirImages.resolve(newFileName);
            Files.copy(imageProduct.getInputStream(), pathFileUpload, StandardCopyOption.REPLACE_EXISTING);
            product.setImage(newFileName);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

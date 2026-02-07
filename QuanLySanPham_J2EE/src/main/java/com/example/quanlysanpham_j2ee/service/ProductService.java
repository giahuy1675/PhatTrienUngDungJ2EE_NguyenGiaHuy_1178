package com.example.quanlysanpham_j2ee.service;

import com.example.quanlysanpham_j2ee.model.Product;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;
import java.util.*;

@Service
public class ProductService {
    private List<Product> listProduct = new ArrayList<>();

    public List<Product> getAll() {
        return listProduct;
    }

    public Product get(int id) {
        return listProduct.stream().filter(p -> p.getId() == id).findFirst().orElse(null);
    }

    public void add(Product newProduct) {
        int maxId = listProduct.stream().mapToInt(Product::getId).max().orElse(0);
        newProduct.setId(maxId + 1);
        listProduct.add(newProduct);
    }

    public void update(Product editProduct) {
        Product find = get(editProduct.getId());
        if (find != null) {
            find.setPrice(editProduct.getPrice());
            find.setName(editProduct.getName());
            if (editProduct.getImage() != null) {
                find.setImage(editProduct.getImage());
            }
        }
    }

    public void updateImage(Product newProduct, MultipartFile imageProduct) {
        if (imageProduct == null || imageProduct.isEmpty()) {
            return; // Không có file thì bỏ qua
        }
        String contentType = imageProduct.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Tệp tải lên không phải là hình ảnh!");
        }
        try {
            // Lưu vào static/images ngoài root dự án
            Path dirImages = Paths.get("static/images");
            if (!Files.exists(dirImages)) {
                Files.createDirectories(dirImages);
            }
            String newFileName = UUID.randomUUID() + "_" + imageProduct.getOriginalFilename();
            Path pathFileUpload = dirImages.resolve(newFileName);
            Files.copy(imageProduct.getInputStream(), pathFileUpload, StandardCopyOption.REPLACE_EXISTING);
            newProduct.setImage(newFileName);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

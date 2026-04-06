package com.example.nguyengiahuybuoi_8;

import com.example.nguyengiahuybuoi_8.model.Category;
import com.example.nguyengiahuybuoi_8.model.Product;
import com.example.nguyengiahuybuoi_8.model.User;
import com.example.nguyengiahuybuoi_8.service.CategoryService;
import com.example.nguyengiahuybuoi_8.service.ProductService;
import com.example.nguyengiahuybuoi_8.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) throws Exception {
        // Check if data already exists
        if (userService.findAllUsers().size() > 0) {
            return; // Data already initialized
        }

        // Create categories
        Category electronics = new Category();
        electronics.setName("Electronics");
        categoryService.saveCategory(electronics);

        Category clothing = new Category();
        clothing.setName("Clothing");
        categoryService.saveCategory(clothing);

        Category books = new Category();
        books.setName("Books");
        categoryService.saveCategory(books);

        // Create products
        Product laptop = new Product();
        laptop.setName("Laptop");
        laptop.setDescription("High-performance laptop");
        laptop.setPrice(new BigDecimal("999.99"));
        laptop.setImageName("laptop.jpg");
        laptop.setCategory(electronics);
        productService.saveProduct(laptop);

        Product phone = new Product();
        phone.setName("Smartphone");
        phone.setDescription("Latest smartphone");
        phone.setPrice(new BigDecimal("699.99"));
        phone.setImageName("smartphone.jpg");
        phone.setCategory(electronics);
        productService.saveProduct(phone);

        Product shirt = new Product();
        shirt.setName("T-Shirt");
        shirt.setDescription("Cotton t-shirt");
        shirt.setPrice(new BigDecimal("19.99"));
        shirt.setImageName("tshirt.jpg");
        shirt.setCategory(clothing);
        productService.saveProduct(shirt);

        Product book = new Product();
        book.setName("Java Programming");
        book.setDescription("Learn Java programming");
        book.setPrice(new BigDecimal("49.99"));
        book.setImageName("java-book.jpg");
        book.setCategory(books);
        productService.saveProduct(book);

        // Create admin user
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword("admin123");
        admin.setEmail("admin@example.com");
        admin.setRole("ADMIN");
        userService.saveUser(admin);

        // Create regular user
        User user = new User();
        user.setUsername("user");
        user.setPassword("user123");
        user.setEmail("user@example.com");
        user.setRole("USER");
        userService.saveUser(user);
    }
}
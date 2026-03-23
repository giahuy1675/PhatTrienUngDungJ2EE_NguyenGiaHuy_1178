package com.example.be_bangiay.controller;

import com.example.be_bangiay.entity.Brand;
import com.example.be_bangiay.entity.Category;
import com.example.be_bangiay.entity.Product;
import com.example.be_bangiay.entity.User;
import com.example.be_bangiay.repository.BrandRepository;
import com.example.be_bangiay.repository.CategoryRepository;
import com.example.be_bangiay.repository.ProductRepository;
import com.example.be_bangiay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/setup")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5500", "http://127.0.0.1:5173", "http://127.0.0.1:5500"})
public class SetupController {
    
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final PasswordEncoder passwordEncoder;
    
    @PostMapping("/create-admin")
    public ResponseEntity<String> createAdmin() {
        try {
            // Check if admin exists
            if (userRepository.findByEmail("admin@bangiay.com").isPresent()) {
                // Delete old admin
                User oldAdmin = userRepository.findByEmail("admin@bangiay.com").get();
                userRepository.delete(oldAdmin);
            }
            
            // Create new admin with properly encoded password
            User admin = new User();
            admin.setEmail("admin@bangiay.com");
            admin.setPassword(passwordEncoder.encode("admin123")); // Encode password
            admin.setFullName("Administrator");
            admin.setPhoneNumber("0123456789");
            admin.setAddress("Admin Office");
            admin.setRole(User.Role.ADMIN);
            admin.setIsActive(true);
            
            userRepository.save(admin);
            
            return ResponseEntity.ok("Admin created successfully!\nEmail: admin@bangiay.com\nPassword: admin123");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/create-user")
    public ResponseEntity<String> createUser() {
        try {
            // Check if user exists
            if (userRepository.findByEmail("user@bangiay.com").isPresent()) {
                // Delete old user
                User oldUser = userRepository.findByEmail("user@bangiay.com").get();
                userRepository.delete(oldUser);
            }
            
            // Create new user with properly encoded password
            User user = new User();
            user.setEmail("user@bangiay.com");
            user.setPassword(passwordEncoder.encode("user123")); // Encode password
            user.setFullName("Khách hàng");
            user.setPhoneNumber("0987654321");
            user.setAddress("123 Đường ABC");
            user.setRole(User.Role.USER);
            user.setIsActive(true);
            
            userRepository.save(user);
            
            return ResponseEntity.ok("User created successfully!\nEmail: user@bangiay.com\nPassword: user123");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/create-sample-data")
    public ResponseEntity<String> createSampleData() {
        try {
            // Create categories
            Category running = createCategoryIfNotExists("Running", "Giày chạy bộ chuyên nghiệp");
            Category basketball = createCategoryIfNotExists("Basketball", "Giày bóng rổ cao cấp");
            Category lifestyle = createCategoryIfNotExists("Lifestyle", "Giày thời trang đường phố");
            Category training = createCategoryIfNotExists("Training", "Giày tập luyện đa năng");
            
            // Create products
            createProductIfNotExists("Nike Air Max Premium", running, 180.0, 220.0,
                "Trải nghiệm sự thoải mái và phong cách vượt trội với Nike Air Max Premium. Sở hữu công nghệ đệm khí tiên tiến.",
                "/images/nike_air_max_premium_1769011457503.png",
                "[\"#000000\",\"#C0C0C0\",\"#E0E0E0\"]",
                "[\"38\",\"39\",\"40\",\"41\",\"42\",\"43\",\"44\",\"45\"]",
                "[\"Đế Air Max\",\"Lưới thoáng khí\",\"Chi tiết phản quang\"]",
                "Nike", "Bán chạy nhất", 4.8, 124, true);
            
            createProductIfNotExists("Adidas Ultraboost Clean", running, 160.0, null,
                "Khi hiệu năng đỉnh cao kết hợp với vẻ ngoài tối giản. Ultraboost Clean mang lại khả năng hoàn trả năng lượng tối đa.",
                "/images/adidas_ultraboost_clean_1769011489146.png",
                "[\"#FFFFFF\",\"#F0F0F0\",\"#D0D0D0\"]",
                "[\"38\",\"39\",\"40\",\"41\",\"42\",\"43\",\"44\",\"45\"]",
                "[\"Đệm Boost\",\"Vải Primeknit\",\"Đế ngoài Stretchweb\"]",
                "Adidas", "Thịnh hành", 4.9, 89, true);
            
            createProductIfNotExists("Jordan 1 Retro High", basketball, 220.0, null,
                "Huyền thoại không bao giờ mờ nhạt. Jordan 1 Retro High tiếp tục khẳng định vị thế biểu tượng của mình.",
                "/images/jordan_1_retro_high_1769011512986.png",
                "[\"#FF0000\",\"#000000\",\"#FFFFFF\"]",
                "[\"38\",\"39\",\"40\",\"41\",\"42\",\"43\",\"44\",\"45\"]",
                "[\"Cổ cao bảo vệ\",\"Da cao cấp\",\"Logo Wings huyền thoại\"]",
                "Nike", null, 5.0, 215, true);
            
            createProductIfNotExists("Converse Chuck Taylor All Star", lifestyle, 85.0, 110.0,
                "Biểu tượng văn hóa đường phố vượt thời gian. Chuck Taylor All Star là lựa chọn hoàn hảo cho phong cách cá nhân.",
                "/images/converse_chuck_taylor_1769011534531.png",
                "[\"#000000\",\"#FFFFFF\",\"#FF0000\"]",
                "[\"36\",\"37\",\"38\",\"39\",\"40\",\"41\",\"42\",\"43\"]",
                "[\"Thiết kế cổ điển\",\"Đế cao su bền bỉ\",\"Vải canvas thoáng khí\"]",
                "Converse", "Giảm giá", 4.7, 342, false);
            
            return ResponseEntity.ok("Sample data created successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    private Category createCategoryIfNotExists(String name, String description) {
        return categoryRepository.findAll().stream()
            .filter(c -> c.getName().equals(name))
            .findFirst()
            .orElseGet(() -> {
                Category cat = new Category();
                cat.setName(name);
                cat.setDescription(description);
                cat.setIsActive(true);
                return categoryRepository.save(cat);
            });
    }
    
    private void createProductIfNotExists(String name, Category category, Double price, Double originalPrice,
                                         String description, String image, String colors, String sizes,
                                         String specs, String brandName, String tag, Double rating, Integer reviews, Boolean featured) {
        if (productRepository.findAll().stream().noneMatch(p -> p.getName().equals(name))) {
            // Tìm hoặc tạo Brand entity
            Brand brand = brandRepository.findByName(brandName)
                .orElseGet(() -> {
                    Brand newBrand = new Brand();
                    newBrand.setName(brandName);
                    newBrand.setIsActive(true);
                    return brandRepository.save(newBrand);
                });
            
            Product product = new Product();
            product.setName(name);
            product.setCategory(category);
            product.setPrice(BigDecimal.valueOf(price));
            if (originalPrice != null) {
                product.setOriginalPrice(BigDecimal.valueOf(originalPrice));
            }
            product.setDescription(description);
            product.setImage(image);
            product.setImages("[\"" + image + "\"]");
            product.setColors(colors);
            product.setSizes(sizes);
            product.setSpecs(specs);
            product.setBrand(brand); // Set Brand object thay vì String
            product.setTag(tag);
            product.setRating(rating);
            product.setReviews(reviews);
            product.setIsFeatured(featured);
            product.setStockQuantity(50);
            product.setIsActive(true);
            productRepository.save(product);
        }
    }
}

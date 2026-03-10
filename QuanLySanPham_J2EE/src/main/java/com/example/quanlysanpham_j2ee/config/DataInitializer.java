package com.example.quanlysanpham_j2ee.config;

import com.example.quanlysanpham_j2ee.model.Role;
import com.example.quanlysanpham_j2ee.model.User;
import com.example.quanlysanpham_j2ee.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Tự động tạo tài khoản admin mặc định khi khởi động lần đầu.
 * Tài khoản: admin / admin123
 */
@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@quanlysanpham.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ROLE_ADMIN);
                admin.setEnabled(true);
                userRepository.save(admin);
                System.out.println("==> Tài khoản ADMIN mặc định đã được tạo: admin / admin123");
            }
        };
    }
}

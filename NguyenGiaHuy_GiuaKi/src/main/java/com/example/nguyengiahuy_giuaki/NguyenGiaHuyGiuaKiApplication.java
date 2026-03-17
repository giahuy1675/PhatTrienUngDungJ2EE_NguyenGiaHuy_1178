package com.example.nguyengiahuy_giuaki;

import org.springframework.boot.SpringApplication;
import com.example.nguyengiahuy_giuaki.entity.Role;
import com.example.nguyengiahuy_giuaki.entity.Student;
import com.example.nguyengiahuy_giuaki.repository.RoleRepository;
import com.example.nguyengiahuy_giuaki.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@SpringBootApplication
public class NguyenGiaHuyGiuaKiApplication {

    public static void main(String[] args) {
        SpringApplication.run(NguyenGiaHuyGiuaKiApplication.class, args);
    }

    @Bean
    CommandLineRunner initAdmin(RoleRepository roleRepository,
                                StudentRepository studentRepository,
                                PasswordEncoder passwordEncoder) {
        return args -> {
            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ADMIN").build()));

            if (!studentRepository.existsByUsername("admin")) {
                Student admin = Student.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin123"))
                        .email("admin@example.com")
                        .roles(Set.of(adminRole))
                        .build();
                studentRepository.save(admin);
            }
        };
    }
}

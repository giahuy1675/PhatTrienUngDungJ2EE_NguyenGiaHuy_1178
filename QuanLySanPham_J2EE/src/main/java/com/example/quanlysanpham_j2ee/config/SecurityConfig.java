package com.example.quanlysanpham_j2ee.config;

import com.example.quanlysanpham_j2ee.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // ===== PUBLIC: ai cũng truy cập được =====
                .requestMatchers("/", "/login", "/register").permitAll()
                .requestMatchers("/static/**", "/images/**", "/css/**", "/js/**").permitAll()

                // ===== ROLE_ADMIN: quản lý sản phẩm (thêm, sửa, xóa) =====
                .requestMatchers("/products/create", "/products/edit/**", "/products/delete/**").hasRole("ADMIN")

                // ===== ROLE_ADMIN: toàn bộ quản lý danh mục =====
                .requestMatchers("/categories/**").hasRole("ADMIN")

                // ===== ROLE_USER + ROLE_ADMIN: xem danh sách sản phẩm =====
                .requestMatchers("/products", "/products/").hasAnyRole("USER", "ADMIN")

                // ===== Các URL còn lại: phải đăng nhập =====
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/", true)
                .failureUrl("/login?error")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            )
            .exceptionHandling(ex -> ex
                .accessDeniedPage("/access-denied")
            )
            .userDetailsService(customUserDetailsService);

        return http.build();
    }
}

package com.example.be_bangiay.service;

import com.example.be_bangiay.dto.AuthResponse;
import com.example.be_bangiay.dto.LoginRequest;
import com.example.be_bangiay.dto.RegisterRequest;
import com.example.be_bangiay.entity.User;
import com.example.be_bangiay.exception.BadRequestException;
import com.example.be_bangiay.repository.UserRepository;
import com.example.be_bangiay.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim();
        String phoneNumber = request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null;

        // Check duplicate email and cross-duplicate with existing phone numbers
        if (userRepository.existsByEmailOrPhoneNumber(email, email)) {
            throw new BadRequestException("Email đã được sử dụng");
        }

        // Check duplicate phone and cross-duplicate with existing emails
        if (phoneNumber != null && !phoneNumber.isEmpty() && userRepository.existsByEmailOrPhoneNumber(phoneNumber, phoneNumber)) {
            throw new BadRequestException("Số điện thoại đã được sử dụng");
        }
        
        // Create new user
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(phoneNumber);
        user.setAddress(request.getAddress());
        user.setRole(User.Role.USER);
        user.setIsActive(true);
        
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name());
        
        return AuthResponse.fromUser(savedUser, "Đăng ký thành công", token);
    }
    
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getEmail().trim();
        boolean isPhoneNumber = identifier.matches("^[0-9]{10,15}$");

        // Find user by exact identifier type to avoid ambiguous OR queries
        Optional<User> userOptional = isPhoneNumber
            ? userRepository.findByPhoneNumber(identifier)
            : userRepository.findByEmail(identifier);

        User user = userOptional
            .orElseThrow(() -> new BadRequestException("Email/số điện thoại hoặc mật khẩu không đúng"));
        
        // Check if account is active
        if (!user.getIsActive()) {
            throw new BadRequestException("Tài khoản đã bị vô hiệu hóa");
        }
        
        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Email/số điện thoại hoặc mật khẩu không đúng");
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        
        return AuthResponse.fromUser(user, "Đăng nhập thành công", token);
    }
}

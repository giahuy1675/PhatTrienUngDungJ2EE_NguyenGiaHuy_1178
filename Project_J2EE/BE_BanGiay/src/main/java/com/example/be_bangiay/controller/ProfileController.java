package com.example.be_bangiay.controller;

import com.example.be_bangiay.dto.ChangePasswordRequest;
import com.example.be_bangiay.dto.UpdateProfileRequest;
import com.example.be_bangiay.entity.User;
import com.example.be_bangiay.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5500", "http://127.0.0.1:5173", "http://127.0.0.1:5500"})
@RequiredArgsConstructor
public class ProfileController {
    
    private final UserService userService;
    
    // Get current user's profile from JWT token
    @GetMapping
    public ResponseEntity<User> getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }
    
    // Update current user's profile
    @PutMapping
    public ResponseEntity<User> updateCurrentUserProfile(
        @Valid @RequestBody UpdateProfileRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(userService.updateProfile(user.getId(), request));
    }
    
    // Change current user's password
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changeCurrentUserPassword(
        @Valid @RequestBody ChangePasswordRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        userService.changePassword(user.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }
    
    // Keep old endpoints for backward compatibility (with userId in path)
    @GetMapping("/{userId}")
    public ResponseEntity<User> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }
    
    @PutMapping("/{userId}")
    public ResponseEntity<User> updateProfile(
        @PathVariable Long userId,
        @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }
    
    @PutMapping("/{userId}/password")
    public ResponseEntity<Map<String, String>> changePassword(
        @PathVariable Long userId,
        @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(userId, request);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }
}

package com.example.be_bangiay.dto;

import com.example.be_bangiay.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private Long id;
    private String email;
    private String fullName;
    private String role;
    private String message;
    private String token;
    
    public static AuthResponse fromUser(User user, String message) {
        return new AuthResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name(),
            message,
            null // Token will be set separately
        );
    }
    
    public static AuthResponse fromUser(User user, String message, String token) {
        return new AuthResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name(),
            message,
            token
        );
    }
}

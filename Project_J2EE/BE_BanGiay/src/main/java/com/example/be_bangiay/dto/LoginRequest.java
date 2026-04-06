package com.example.be_bangiay.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Email hoặc số điện thoại không được trống")
    private String email;
    
    @NotBlank(message = "Mật khẩu không được trống")
    private String password;
}

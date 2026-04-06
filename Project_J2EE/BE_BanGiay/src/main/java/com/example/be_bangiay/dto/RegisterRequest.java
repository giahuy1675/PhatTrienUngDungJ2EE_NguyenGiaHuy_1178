package com.example.be_bangiay.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email không được trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @NotBlank(message = "Mật khẩu không được trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;
    
    @NotBlank(message = "Họ tên không được trống")
    @Size(min = 2, max = 100, message = "Họ tên phải từ 2-100 ký tự")
    private String fullName;
    
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Số điện thoại không hợp lệ")
    private String phoneNumber;
    
    @Size(max = 500, message = "Địa chỉ không được vượt quá 500 ký tự")
    private String address;
}

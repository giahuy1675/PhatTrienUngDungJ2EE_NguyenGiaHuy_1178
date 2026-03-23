package com.example.be_bangiay.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {
    @NotBlank(message = "idToken không được để trống")
    private String idToken;
}

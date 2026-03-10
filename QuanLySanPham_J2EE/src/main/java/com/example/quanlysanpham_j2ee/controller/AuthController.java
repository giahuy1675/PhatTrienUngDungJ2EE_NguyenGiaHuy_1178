package com.example.quanlysanpham_j2ee.controller;

import com.example.quanlysanpham_j2ee.model.User;
import com.example.quanlysanpham_j2ee.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AuthController {

    @Autowired
    private UserService userService;

    // ===== ĐĂNG NHẬP =====
    @GetMapping("/login")
    public String loginPage(@RequestParam(value = "error", required = false) String error,
                            @RequestParam(value = "logout", required = false) String logout,
                            Model model) {
        if (error != null) {
            model.addAttribute("errorMsg", "Tên đăng nhập hoặc mật khẩu không đúng!");
        }
        if (logout != null) {
            model.addAttribute("logoutMsg", "Bạn đã đăng xuất thành công.");
        }
        return "auth/login";
    }

    // ===== ĐĂNG KÝ =====
    @GetMapping("/register")
    public String registerPage(Model model) {
        model.addAttribute("user", new User());
        return "auth/register";
    }

    @PostMapping("/register")
    public String register(@ModelAttribute("user") @Valid User user,
                           BindingResult result,
                           Model model) {
        if (result.hasErrors()) {
            return "auth/register";
        }
        if (userService.existsByUsername(user.getUsername())) {
            model.addAttribute("usernameError", "Tên đăng nhập đã tồn tại!");
            return "auth/register";
        }
        if (userService.existsByEmail(user.getEmail())) {
            model.addAttribute("emailError", "Email đã được sử dụng!");
            return "auth/register";
        }
        userService.register(user);
        return "redirect:/login?registered";
    }

    // ===== ACCESS DENIED =====
    @GetMapping("/access-denied")
    public String accessDenied() {
        return "auth/access-denied";
    }
}

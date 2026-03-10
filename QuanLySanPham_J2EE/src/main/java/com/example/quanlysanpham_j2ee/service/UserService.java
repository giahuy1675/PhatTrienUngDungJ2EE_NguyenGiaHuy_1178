package com.example.quanlysanpham_j2ee.service;

import com.example.quanlysanpham_j2ee.model.User;

public interface UserService {
    void register(User user);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}

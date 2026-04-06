package com.example.nguyengiahuybuoi_8.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Set;

@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private String email;
    private String role; // ADMIN or USER

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<Order> orders;
}
package com.example.nguyengiahuy_giuaki.repository;

import com.example.nguyengiahuy_giuaki.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}

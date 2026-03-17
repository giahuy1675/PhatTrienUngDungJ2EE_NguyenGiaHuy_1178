package com.example.nguyengiahuy_giuaki.service;

import com.example.nguyengiahuy_giuaki.entity.Role;
import com.example.nguyengiahuy_giuaki.entity.Student;
import com.example.nguyengiahuy_giuaki.repository.RoleRepository;
import com.example.nguyengiahuy_giuaki.repository.StudentRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class StudentService {
    private final StudentRepository studentRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentService(StudentRepository studentRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Student registerStudent(String username, String password, String email) {
        Role studentRole = roleRepository.findByName("STUDENT")
                .orElseGet(() -> roleRepository.save(Role.builder().name("STUDENT").build()));

        Student student = Student.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .email(email)
                .roles(Set.of(studentRole))
                .build();
        return studentRepository.save(student);
    }
}

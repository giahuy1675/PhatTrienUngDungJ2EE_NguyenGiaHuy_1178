package com.example.nguyengiahuy_giuaki.service;

import com.example.nguyengiahuy_giuaki.entity.Course;
import com.example.nguyengiahuy_giuaki.repository.CourseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class CourseService {
    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public Page<Course> getCourses(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (keyword == null || keyword.isBlank()) {
            return courseRepository.findAll(pageable);
        }
        return courseRepository.findByNameContainingIgnoreCase(keyword, pageable);
    }

    public Course save(Course course) {
        return courseRepository.save(course);
    }

    public Course getById(Long id) {
        return courseRepository.findById(id).orElseThrow();
    }

    public void delete(Long id) {
        courseRepository.deleteById(id);
    }
}

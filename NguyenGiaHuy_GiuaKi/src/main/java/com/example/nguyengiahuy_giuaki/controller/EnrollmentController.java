package com.example.nguyengiahuy_giuaki.controller;

import com.example.nguyengiahuy_giuaki.entity.Course;
import com.example.nguyengiahuy_giuaki.entity.Enrollment;
import com.example.nguyengiahuy_giuaki.entity.Student;
import com.example.nguyengiahuy_giuaki.repository.CourseRepository;
import com.example.nguyengiahuy_giuaki.service.EnrollmentService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;

@Controller
public class EnrollmentController {
    private final EnrollmentService enrollmentService;
    private final CourseRepository courseRepository;

    public EnrollmentController(EnrollmentService enrollmentService, CourseRepository courseRepository) {
        this.enrollmentService = enrollmentService;
        this.courseRepository = courseRepository;
    }

    @PostMapping("/enroll/{courseId}")
    public String enroll(@PathVariable Long courseId, @AuthenticationPrincipal Student student) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        if (!enrollmentService.isEnrolled(student.getId(), courseId)) {
            enrollmentService.enroll(student, course);
        }
        return "redirect:/home";
    }

    @GetMapping("/my-courses")
    public String myCourses(@AuthenticationPrincipal Student student, Model model) {
        List<Enrollment> enrollments = enrollmentService.getByStudent(student);
        model.addAttribute("enrollments", enrollments);
        return "my-courses";
    }
}

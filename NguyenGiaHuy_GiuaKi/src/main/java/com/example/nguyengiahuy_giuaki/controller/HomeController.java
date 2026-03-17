package com.example.nguyengiahuy_giuaki.controller;

import com.example.nguyengiahuy_giuaki.entity.Course;
import com.example.nguyengiahuy_giuaki.service.CourseService;
import com.example.nguyengiahuy_giuaki.service.EnrollmentService;
import com.example.nguyengiahuy_giuaki.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class HomeController {
    private final CourseService courseService;
    private final EnrollmentService enrollmentService;

    public HomeController(CourseService courseService, EnrollmentService enrollmentService) {
        this.courseService = courseService;
        this.enrollmentService = enrollmentService;
    }

    @GetMapping({"/", "/home", "/courses"})
    public String home(@RequestParam(defaultValue = "0") int page,
                       @RequestParam(defaultValue = "5") int size,
                       @RequestParam(required = false) String keyword,
                       Model model,
                       @AuthenticationPrincipal Student student) {
        Page<Course> coursePage = courseService.getCourses(keyword, page, size);
        model.addAttribute("coursePage", coursePage);
        model.addAttribute("keyword", keyword);
        model.addAttribute("student", student);
        model.addAttribute("enrollmentService", enrollmentService);
        return "home";
    }
}

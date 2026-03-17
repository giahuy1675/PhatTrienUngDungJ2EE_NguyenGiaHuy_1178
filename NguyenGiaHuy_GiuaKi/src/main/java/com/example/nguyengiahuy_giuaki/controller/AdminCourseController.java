package com.example.nguyengiahuy_giuaki.controller;

import com.example.nguyengiahuy_giuaki.entity.Category;
import com.example.nguyengiahuy_giuaki.entity.Course;
import com.example.nguyengiahuy_giuaki.repository.CategoryRepository;
import com.example.nguyengiahuy_giuaki.service.CourseService;
import com.example.nguyengiahuy_giuaki.service.FileStorageService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Controller
@RequestMapping("/admin/courses")
public class AdminCourseController {
    private final CourseService courseService;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    public AdminCourseController(CourseService courseService,
                                 CategoryRepository categoryRepository,
                                 FileStorageService fileStorageService) {
        this.courseService = courseService;
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public String list(Model model) {
        model.addAttribute("courses", courseService.getCourses(null, 0, Integer.MAX_VALUE).getContent());
        return "admin/course-list";
    }

    @GetMapping("/create")
    public String createForm(Model model) {
        model.addAttribute("course", new Course());
        model.addAttribute("categories", categoryRepository.findAll());
        return "admin/course-form";
    }

    @PostMapping("/create")
    public String create(@ModelAttribute Course course,
                         @RequestParam("categoryId") Long categoryId,
                         @RequestParam("imageFile") MultipartFile imageFile) throws IOException {
        course.setCategory(categoryRepository.findById(categoryId).orElseThrow());
        if (!imageFile.isEmpty()) {
            course.setImage(fileStorageService.storeFile(imageFile));
        }
        courseService.save(course);
        return "redirect:/admin/courses";
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        model.addAttribute("course", courseService.getById(id));
        model.addAttribute("categories", categoryRepository.findAll());
        return "admin/course-form";
    }

    @PostMapping("/edit/{id}")
    public String update(@PathVariable Long id,
                         @ModelAttribute Course course,
                         @RequestParam("categoryId") Long categoryId,
                         @RequestParam("imageFile") MultipartFile imageFile) throws IOException {
        course.setId(id);
        course.setCategory(categoryRepository.findById(categoryId).orElseThrow());
        if (!imageFile.isEmpty()) {
            course.setImage(fileStorageService.storeFile(imageFile));
        } else {
            course.setImage(courseService.getById(id).getImage());
        }
        courseService.save(course);
        return "redirect:/admin/courses";
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id) {
        courseService.delete(id);
        return "redirect:/admin/courses";
    }
}

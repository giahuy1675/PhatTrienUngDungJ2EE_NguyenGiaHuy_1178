package com.example.nguyengiahuy_giuaki.service;

import com.example.nguyengiahuy_giuaki.entity.Course;
import com.example.nguyengiahuy_giuaki.entity.Enrollment;
import com.example.nguyengiahuy_giuaki.entity.Student;
import com.example.nguyengiahuy_giuaki.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository) {
        this.enrollmentRepository = enrollmentRepository;
    }

    public boolean isEnrolled(Long studentId, Long courseId) {
        return enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId);
    }

    public Enrollment enroll(Student student, Course course) {
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .enrollDate(LocalDateTime.now())
                .build();
        return enrollmentRepository.save(enrollment);
    }

    public List<Enrollment> getByStudent(Student student) {
        return enrollmentRepository.findByStudent(student);
    }
}

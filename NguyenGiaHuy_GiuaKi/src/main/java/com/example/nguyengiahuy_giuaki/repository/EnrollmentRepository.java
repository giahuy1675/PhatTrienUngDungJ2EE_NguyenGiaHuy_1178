package com.example.nguyengiahuy_giuaki.repository;

import com.example.nguyengiahuy_giuaki.entity.Enrollment;
import com.example.nguyengiahuy_giuaki.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudent(Student student);
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
}

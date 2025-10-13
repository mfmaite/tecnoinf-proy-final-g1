package com.mentora.backend.repository;

import com.mentora.backend.model.Course;
import com.mentora.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByProfessorsContains(User professor);
    List<Course> findByStudentsContains(User student);
}

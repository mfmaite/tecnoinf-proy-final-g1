package com.mentora.backend.repository;

import com.mentora.backend.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCourse_IdOrderByCreatedDateAsc(String courseId);
    Quiz findByIdAndCourse_Id(Long id, String courseId);
}

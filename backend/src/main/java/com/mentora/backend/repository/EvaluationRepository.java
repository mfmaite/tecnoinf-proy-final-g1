package com.mentora.backend.repository;

import com.mentora.backend.model.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByCourse_IdOrderByCreatedDateAsc(String courseId);
    Optional<Evaluation> findById(String evaluationId);
}



package com.mentora.backend.repository;

import com.mentora.backend.model.EvaluationSubmission;
import com.mentora.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationSubmissionRepository extends JpaRepository<EvaluationSubmission, String> {

    // Obtener todas las entregas de un estudiante
    List<EvaluationSubmission> findAllByStudent(User student);

    // Obtener todas las entregas de una evaluación específica
    List<EvaluationSubmission> findAllByEvaluationId(Long evaluationId);

    // Opcional: buscar una entrega específica de un estudiante para una evaluación
    EvaluationSubmission findByEvaluationIdAndStudentCi(Long evaluationId, String studentCi);
}

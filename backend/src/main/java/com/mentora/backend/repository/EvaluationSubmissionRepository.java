package com.mentora.backend.repository;

import com.mentora.backend.model.EvaluationSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationSubmissionRepository extends JpaRepository<EvaluationSubmission, Long> {

    List<EvaluationSubmission> findByEvaluationId(Long evaluationId);

    List<EvaluationSubmission> findByEvaluationIdAndAuthorCi(Long evaluationId, String authorCi);
}

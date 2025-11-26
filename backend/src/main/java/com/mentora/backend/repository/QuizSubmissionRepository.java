package com.mentora.backend.repository;

import com.mentora.backend.model.QuizSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizSubmissionRepository extends JpaRepository<QuizSubmission, Long> {
    List<QuizSubmission> findByQuizIdAndAuthorCi(Long quizId, String authorCi);
}



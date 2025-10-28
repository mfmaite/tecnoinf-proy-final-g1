package com.mentora.backend.repository;

import com.mentora.backend.model.Forum;
import com.mentora.backend.model.ForumType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ForumRepository extends JpaRepository<Forum, Long> {
    Optional<Forum> findByCourseIdAndType(String courseId, ForumType type);
}

package com.mentora.backend.repository;

import com.mentora.backend.model.Content;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentRepository extends JpaRepository<Content, Long> {

    List<Content> findByCourseIdOrderByCreatedAtDesc(Long courseId);

}

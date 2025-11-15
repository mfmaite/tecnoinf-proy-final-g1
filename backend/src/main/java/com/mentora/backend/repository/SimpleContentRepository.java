package com.mentora.backend.repository;

import com.mentora.backend.model.SimpleContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SimpleContentRepository extends JpaRepository<SimpleContent, Long> {

    List<SimpleContent> findByCourse_IdOrderByCreatedDateAsc(String courseId);

    SimpleContent findByIdAndCourse_Id(Long id, String courseId);
}

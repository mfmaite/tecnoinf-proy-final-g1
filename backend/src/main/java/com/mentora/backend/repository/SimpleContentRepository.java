package com.mentora.backend.repository;

import com.mentora.backend.model.SimpleContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SimpleContentRepository extends JpaRepository<SimpleContent, Long> {

}

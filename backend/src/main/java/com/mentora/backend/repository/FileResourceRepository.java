package com.mentora.backend.repository;

import com.mentora.backend.model.FileResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileResourceRepository extends JpaRepository<FileResource, Long> {

}

package com.mentora.backend.repository;

import com.mentora.backend.model.Activity;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
  List<Activity> findByUser_Ci(String ci);
  List<Activity> findByUser_CiAndCreatedDateBetween(String ci, LocalDateTime start, LocalDateTime end);
}

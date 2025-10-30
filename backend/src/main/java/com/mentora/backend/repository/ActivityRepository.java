package com.mentora.backend.repository;

import com.mentora.backend.model.Activity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
  List<Activity> findByUser_Ci(String ci);
}

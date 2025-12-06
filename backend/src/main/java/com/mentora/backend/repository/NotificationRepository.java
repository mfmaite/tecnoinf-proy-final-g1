package com.mentora.backend.repository;

import com.mentora.backend.model.Notification;
import com.mentora.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserOrderByCreatedDateDesc(User user);
}

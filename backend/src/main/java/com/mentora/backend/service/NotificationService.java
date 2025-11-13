package com.mentora.backend.service;

import com.mentora.backend.model.Notification;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.NotificationRepository;
import com.mentora.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public Notification createNotification(String userCi, String message, String link) {
        User user = userRepository.findById(userCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        Notification notification = new Notification(user, message, link);

        return notificationRepository.save(notification);
    }

    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificación no encontrada"));
        notification.setRead(Boolean.TRUE);
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByIdDesc(user);
    }
}

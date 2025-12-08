package com.mentora.backend.service;

import com.mentora.backend.dt.DtNotification;
import com.mentora.backend.model.Notification;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.NotificationRepository;
import com.mentora.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PushNotificationService pushNotificationService;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository, PushNotificationService pushNotificationService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.pushNotificationService = pushNotificationService;
    }

    public Notification createNotification(String userCi, String message, String link) {
        User user = userRepository.findById(userCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        Notification notification = new Notification(user, message, link);

        Notification saved = notificationRepository.save(notification);

        pushNotificationService.sendToUser(userCi, "Mentora", message, link);
        System.out.println("\n\nsendToUser: " + userCi + " " + message + " " + link);

        return saved;
    }

    public void markAsRead(String notificationId, String userCi) {
        User user = userRepository.findById(userCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        Notification notification = notificationRepository.findById(notificationId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificación no encontrada"));

        if (!notification.getUser().equals(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para marcar esta notificación como leída");
        }

        notification.setRead(Boolean.TRUE);
        notificationRepository.save(notification);
    }

    public List<DtNotification> getUserNotifications(String userCi) {
        User user = userRepository.findById(userCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        return notificationRepository.findByUserOrderByCreatedDateDesc(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public DtNotification toDto(Notification n) {
        return new DtNotification(
                n.getId(),
                n.getMessage(),
                n.getLink(),
                n.getRead()
        );
    }
}

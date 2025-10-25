package com.mentora.backend.service;

import com.mentora.backend.model.Notification;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Crea una notificación para un usuario.
     */
    public Notification createNotification(User user, String message, String link) {
        Notification notification = new Notification(user, message, link);
        return notificationRepository.save(notification);
    }

    /**
     * La idea es que cuando le den click para usar el link, se cambie el valor del boolean a true, como que ya lo leyo
     */
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    /**
     * Esto es para cuando este el boton de notificaciones, las puedan sacar de aca y listarselas
     */
    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByIdDesc(user);
    }
}

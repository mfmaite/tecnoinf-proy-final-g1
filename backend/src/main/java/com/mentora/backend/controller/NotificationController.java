package com.mentora.backend.controller;

import com.mentora.backend.repository.NotificationRepository;
import com.mentora.backend.responses.DtApiResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<DtApiResponse<Void>> markAsRead(@PathVariable String notificationId) {
        return notificationRepository.findById(notificationId)
                .map(notification -> {
                    notification.setRead(true);
                    notificationRepository.save(notification);
                    return ResponseEntity.ok(new DtApiResponse<Void>(
                            true,
                            HttpStatus.OK.value(),
                            "Notificación marcada como leída",
                            null
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new DtApiResponse<Void>(
                                false,
                                HttpStatus.NOT_FOUND.value(),
                                "Notificación no encontrada",
                                null
                        )));
    }
}

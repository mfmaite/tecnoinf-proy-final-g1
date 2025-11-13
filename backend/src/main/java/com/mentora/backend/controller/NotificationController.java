package com.mentora.backend.controller;

import com.mentora.backend.responses.DtApiResponse;
import com.mentora.backend.service.NotificationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<DtApiResponse<Void>> markAsRead(@PathVariable String notificationId) {
        try {
            notificationService.markAsRead(notificationId);

            return ResponseEntity.ok(new DtApiResponse<Void>(
                true,
                HttpStatus.OK.value(),
                "Notificación marcada como leída",
                null)
            );
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new DtApiResponse<Void>(
                false,
                e.getStatusCode().value(),
                e.getReason(),
                null)
            );
        }
    }
}

package com.mentora.backend.controller;

import com.mentora.backend.dt.DtNotification;
import com.mentora.backend.model.User;
import com.mentora.backend.responses.DtApiResponse;
import com.mentora.backend.service.NotificationService;

import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@Tag(name = "Notificaciones", description = "Gestiona las notificaciones del usuario")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Operation(
            summary = "Marcar notificación como leída",
            description = "Marca una notificación existente como leída según su ID.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "200", description = "Notificación marcada como leída correctamente")
    @ApiResponse(responseCode = "404", description = "La notificación no existe")
    @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    @PostMapping("/{notificationId}/read")
    public ResponseEntity<DtApiResponse<Void>> markAsRead(@PathVariable String notificationId) {
        try {
            notificationService.markAsRead(notificationId);

            return ResponseEntity.ok(new DtApiResponse<>(
                    true,
                    HttpStatus.OK.value(),
                    "Notificación marcada como leída",
                    null
            ));

        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(
                    new DtApiResponse<>(
                            false,
                            e.getStatusCode().value(),
                            e.getReason(),
                            null
                    )
            );
        }
    }

    @Operation(
            summary = "Listar notificaciones del usuario",
            description = "Retorna todas las notificaciones del usuario autenticado, ordenadas de más reciente a más antigua.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente")
    @ApiResponse(responseCode = "403", description = "No autorizado")
    @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    @GetMapping
    public ResponseEntity<DtApiResponse<List<DtNotification>>> getUserNotifications(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();

            List<DtNotification> notifications = notificationService
                    .getUserNotifications(user)
                    .stream()
                    .map(DtNotification::new)
                    .toList();

            return ResponseEntity.ok(new DtApiResponse<>(
                    true,
                    HttpStatus.OK.value(),
                    "Notificaciones obtenidas correctamente",
                    notifications
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new DtApiResponse<>(
                            false,
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            e.getMessage(),
                            null
                    )
            );
        }
    }
}


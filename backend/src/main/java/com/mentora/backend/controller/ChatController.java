package com.mentora.backend.controller;

import com.mentora.backend.dt.DtChat;
import com.mentora.backend.dt.DtMessage;
import com.mentora.backend.responses.DtApiResponse;
import com.mentora.backend.service.ChatService;
import com.mentora.backend.requests.SendMessageRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/chats")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @Operation(
        summary = "Enviar un mensaje a un usuario",
        description = "Permite enviar un mensaje a un usuario.",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Mensaje enviado correctamente")
    @ApiResponse(responseCode = "403", description = "No tienes permisos para enviar mensajes")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    @PostMapping("/send")
    @PreAuthorize("hasRole('PROFESOR') or hasRole('ESTUDIANTE')")
    public ResponseEntity<DtApiResponse<DtMessage>> sendMessage(
            Authentication authentication,
            @RequestBody SendMessageRequest request) {

        try {
            String senderCi = authentication.getName();
            DtMessage dtMessage = chatService.sendMessage(senderCi, request.getRecipientCi(), request.getMessage());
            return ResponseEntity.ok().body(new DtApiResponse<>(
                true,
                HttpStatus.OK.value(),
                "Mensaje enviado correctamente",
                dtMessage
            ));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new DtApiResponse<>(
                false,
                e.getStatusCode().value(),
                e.getReason(),
                null
            ));
        }
    }

    @Operation(
        summary = "Obtener chats de un usuario",
        description = "Permite obtener chats de un usuario.",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Chats obtenidos correctamente")
    @ApiResponse(responseCode = "403", description = "No tienes permisos para obtener chats")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    @GetMapping
    @PreAuthorize("hasRole('PROFESOR') or hasRole('ESTUDIANTE')")
    public ResponseEntity<DtApiResponse<List<DtChat>>> getChats(
            Authentication authentication
    ) {
        try {
            String requesterCi = authentication.getName();
            List<DtChat> chats = chatService.getChats(requesterCi);
            return ResponseEntity.ok().body(new DtApiResponse<>(
                true,
                HttpStatus.OK.value(),
                "Chats obtenidos correctamente",
                chats
            ));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new DtApiResponse<>(
                false,
                e.getStatusCode().value(),
                e.getReason(),
                null
            ));
        }
    }

    @Operation(
        summary = "Obtener mensajes de un chat",
        description = "Permite obtener mensajes de un chat.",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Mensajes obtenidos correctamente")
    @ApiResponse(responseCode = "403", description = "No tienes permisos para obtener mensajes")
    @ApiResponse(responseCode = "404", description = "Chat no encontrado")
    @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    @GetMapping("/{chatId}/messages")
    @PreAuthorize("hasRole('PROFESOR') or hasRole('ESTUDIANTE')")
    public ResponseEntity<DtApiResponse<List<DtMessage>>> getMessages(
            @PathVariable Long chatId,
            Authentication authentication
    ) {
        try {
            String requesterCi = authentication.getName();
            List<DtMessage> messages = chatService.getMessages(chatId, requesterCi);

            return ResponseEntity.ok().body(new DtApiResponse<>(
                true,
                HttpStatus.OK.value(),
                "Mensajes obtenidos correctamente",
                messages
            ));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new DtApiResponse<>(
                false,
                e.getStatusCode().value(),
                e.getReason(),
                null
            ));
        }
    }

    @Operation(
        summary = "Obtener mensajes con un usuario",
        description = "Obtiene (y crea si no existe) el chat 1:1 con el usuario dado y devuelve sus mensajes ordenados por fecha.",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Mensajes obtenidos correctamente")
    @ApiResponse(responseCode = "403", description = "No tienes permisos para obtener mensajes")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    @GetMapping("/with/{partnerCi}")
    @PreAuthorize("hasRole('PROFESOR') or hasRole('ESTUDIANTE')")
    public ResponseEntity<DtApiResponse<List<DtMessage>>> getMessagesWith(
            @PathVariable String partnerCi,
            Authentication authentication
    ) {
        try {
            String requesterCi = authentication.getName();
            List<DtMessage> messages = chatService.getMessagesWith(requesterCi, partnerCi);

            return ResponseEntity.ok().body(new DtApiResponse<>(
                true,
                HttpStatus.OK.value(),
                "Mensajes obtenidos correctamente",
                messages
            ));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new DtApiResponse<>(
                false,
                e.getStatusCode().value(),
                e.getReason(),
                null
            ));
        }
    }
}


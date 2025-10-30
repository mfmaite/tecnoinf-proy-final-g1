package com.mentora.backend.controller;

import com.mentora.backend.dt.DtMessage;
import com.mentora.backend.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    // Enviar mensaje
    @PostMapping("/send")
    @PreAuthorize("hasRole('PROFESOR') or hasRole('ESTUDIANTE')")
    public ResponseEntity<DtMessage> sendMessage(
            @AuthenticationPrincipal String senderCi,
            @RequestParam String recipientCi,
            @RequestParam String courseId,
            @RequestParam String message) {

        DtMessage dtMessage = chatService.sendMessage(senderCi, recipientCi, message, courseId);
        return ResponseEntity.ok(dtMessage);
    }

    // Obtener mensajes de un chat
    @GetMapping("/{chatId}/messages")
    @PreAuthorize("hasRole('PROFESOR') or hasRole('ESTUDIANTE')")
    public ResponseEntity<List<DtMessage>> getMessages(
            @PathVariable Long chatId,
            @AuthenticationPrincipal String requesterCi) {

        List<DtMessage> messages = chatService.getMessages(chatId, requesterCi);
        return ResponseEntity.ok(messages);
    }
}


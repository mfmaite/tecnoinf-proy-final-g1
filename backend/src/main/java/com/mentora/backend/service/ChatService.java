package com.mentora.backend.service;

import com.mentora.backend.dt.DtMessage;
import com.mentora.backend.model.Chat;
import com.mentora.backend.model.Message;
import com.mentora.backend.model.Role;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.ChatRepository;
import com.mentora.backend.repository.MessageRepository;
import com.mentora.backend.repository.UserCourseRepository;
import com.mentora.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final UserCourseRepository userCourseRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public ChatService(ChatRepository chatRepository,
                       MessageRepository messageRepository,
                       UserRepository userRepository,
                       UserCourseRepository userCourseRepository,
                       NotificationService notificationService,
                       EmailService emailService) {
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.userCourseRepository = userCourseRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    // Enviar mensaje privado
    public DtMessage sendMessage(String senderCi, String recipientCi, String messageText, String courseId) {
        User sender = userRepository.findByCi(senderCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario remitente no encontrado"));

        User recipient = userRepository.findByCi(recipientCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario destinatario no encontrado"));

        // Validar que compartan curso
        boolean shareCourse = userCourseRepository.findAllByUser(sender).stream()
                .anyMatch(uc -> uc.getCourse().getId().equals(courseId) &&
                        userCourseRepository.existsByCourseAndUser(uc.getCourse(), recipient));

        if (!shareCourse) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No comparten el curso indicado");
        }

        // Validar roles
        if (sender.getRole() == Role.PROFESOR && recipient.getRole() != Role.ESTUDIANTE ||
                sender.getRole() == Role.ESTUDIANTE && recipient.getRole() != Role.PROFESOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Rol inválido para enviar mensaje");
        }

        // Buscar chat existente o crear uno nuevo
        Chat chat = chatRepository.findByParticipants(sender, recipient)
                .orElseGet(() -> chatRepository.save(new Chat(sender, recipient)));

        // Crear mensaje
        Message message = new Message(chat, sender, messageText, LocalDateTime.now());
        messageRepository.save(message);

        // Notificación interna
        notificationService.createNotification(recipient.getCi(),
                "Nuevo mensaje de " + sender.getName(),
                "/chat/" + chat.getId());

        // Email
        emailService.sendEmail(recipient.getEmail(),
                "Nuevo mensaje de " + sender.getName(),
                messageText);

        return mapToDtMessage(message);
    }

    // Listar mensajes de un chat
    public List<DtMessage> getMessages(Long chatId, String requesterCi) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat no encontrado"));

        // Validar que requester sea participante
        if (!chat.getParticipant1Id().getCi().equals(requesterCi) &&
                !chat.getParticipant2Id().getCi().equals(requesterCi)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para ver este chat");
        }

        return messageRepository.findAllByChatOrderByDateSentAsc(chat).stream()
                .map(this::mapToDtMessage)
                .collect(Collectors.toList());
    }

    private DtMessage mapToDtMessage(Message message) {
        return new DtMessage(
                message.getId(),
                message.getMessage(),
                message.getDateSent(),
                message.getChat().getId(),
                message.getSendByUser().getCi()
        );
    }
}

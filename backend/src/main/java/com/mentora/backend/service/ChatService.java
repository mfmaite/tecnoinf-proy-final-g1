package com.mentora.backend.service;

import com.mentora.backend.dt.DtChat;
import com.mentora.backend.dt.DtMessage;
import com.mentora.backend.model.Chat;
import com.mentora.backend.model.Message;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.ChatRepository;
import com.mentora.backend.repository.MessageRepository;
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
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final UserService userService;

    public ChatService(ChatRepository chatRepository,
        MessageRepository messageRepository,
        UserRepository userRepository,
        NotificationService notificationService,
        EmailService emailService,
        UserService userService
    ) {
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.userService = userService;
    }

    public DtMessage sendMessage(String senderCi, String recipientCi, String messageText) {
        User sender = userRepository.findByCi(senderCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario remitente no encontrado"));

        User recipient = userRepository.findByCi(recipientCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario destinatario no encontrado"));

        List<Chat> existing = chatRepository.findByParticipants(sender, recipient);
        Chat chat = existing.isEmpty() ? chatRepository.save(new Chat(sender, recipient)) : existing.get(0);

        Message message = new Message(chat, sender, messageText, LocalDateTime.now());
        messageRepository.save(message);

        notificationService.createNotification(recipient.getCi(),
                "Nuevo mensaje de " + sender.getName(),
                "/chats/" + chat.getId());

        emailService.sendEmail(recipient.getEmail(),
                "Nuevo mensaje de " + sender.getName(),
                messageText);

        return getDtMessage(message);
    }

    public List<DtMessage> getMessages(Long chatId, String requesterCi) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat no encontrado"));

        if (!chat.getParticipant1Id().getCi().equals(requesterCi) &&
                !chat.getParticipant2Id().getCi().equals(requesterCi)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permisos para ver este chat");
        }

        return messageRepository.findAllByChatOrderByDateSentAsc(chat).stream()
                .map(this::getDtMessage)
                .collect(Collectors.toList());
    }

    public List<DtMessage> getMessagesWith(String requesterCi, String partnerCi) {
        User requester = userRepository.findByCi(requesterCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        User partner = userRepository.findByCi(partnerCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario destino no encontrado"));

        List<Chat> existing = chatRepository.findByParticipants(requester, partner);
        Chat chat = existing.isEmpty() ? chatRepository.save(new Chat(requester, partner)) : existing.get(0);

        return messageRepository.findAllByChatOrderByDateSentAsc(chat).stream()
                .map(this::getDtMessage)
                .collect(Collectors.toList());
    }

    public List<DtChat> getChats(String requesterCi) {
        User requester = userRepository.findByCi(requesterCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        List<Chat> chatList = chatRepository.findAllByParticipant(requester);

        return chatList.stream()
                .map(this::getDtChat)
                .collect(Collectors.toList());
    }

    private DtMessage getDtMessage(Message message) {
        return new DtMessage(
                message.getId(),
                message.getMessage(),
                message.getDateSent(),
                message.getChat().getId(),
                message.getSendByUser().getCi()
        );
    }

    private DtChat getDtChat(Chat chat) {
        return new DtChat(
                chat.getId(),
                userService.getUserDto(chat.getParticipant1Id()),
                userService.getUserDto(chat.getParticipant2Id())
        );
    }
}

package com.mentora.backend.dt;

import java.time.LocalDateTime;

public class DtMessage {

    private Long id;
    private String message;
    private LocalDateTime dateSent;
    private Long chatId;
    private String sendByUserCi;

    public DtMessage() {}

    public DtMessage(Long id, String message, LocalDateTime dateSent, Long chatId, String sendByUserCi) {
        this.id = id;
        this.message = message;
        this.dateSent = dateSent;
        this.chatId = chatId;
        this.sendByUserCi = sendByUserCi;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getDateSent() { return dateSent; }
    public void setDateSent(LocalDateTime dateSent) { this.dateSent = dateSent; }

    public Long getChatId() { return chatId; }
    public void setChatId(Long chatId) { this.chatId = chatId; }

    public String getSendByUserCi() { return sendByUserCi; }
    public void setSendByUserCi(String sendByUserCi) { this.sendByUserCi = sendByUserCi; }
}

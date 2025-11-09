package com.mentora.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Message")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private LocalDateTime dateSent;

    @ManyToOne(optional = false)
    @JoinColumn(name = "chatId", referencedColumnName = "id", nullable = false)
    private Chat chat;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sendByUserId", referencedColumnName = "ci", nullable = false)
    private User sendByUser;

    //Constructores
    public Message() {}

    public Message(Chat chat, User sendByUser, String message, LocalDateTime dateSent) {
        this.chat = chat;
        this.sendByUser = sendByUser;
        this.message = message;
        this.dateSent = dateSent;
    }

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getDateSent() { return dateSent; }
    public void setDateSent(LocalDateTime dateSent) { this.dateSent = dateSent; }

    public Chat getChat() { return chat; }
    public void setChat(Chat chat) { this.chat = chat; }

    public User getSendByUser() { return sendByUser; }
    public void setSendByUser(User sendByUser) { this.sendByUser = sendByUser; }
}

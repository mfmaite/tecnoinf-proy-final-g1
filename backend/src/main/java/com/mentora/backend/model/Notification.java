package com.mentora.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    private String id = UUID.randomUUID().toString();

    @ManyToOne(optional = false)
    @JoinColumn(name = "userCi", referencedColumnName = "ci", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String message;

    @Column(nullable = false)
    private String link;

    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    // === Constructores ===
    public Notification() {}

    public Notification(User user, String message, String link) {
        this.user = user;
        this.message = message;
        this.link = link;
        this.isRead = false;
        this.createdDate = LocalDateTime.now();
    }

    // === Getters y Setters ===
    public String getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public Boolean getRead() { return isRead; }
    public void setRead(Boolean isRead) { this.isRead = isRead; }
}

package com.mentora.backend.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "Notifications")
public class Notification {

    @Id
    private String id = UUID.randomUUID().toString();

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_ci", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String message;

    @Column(nullable = false)
    private String link;

    @Column(nullable = false)
    private Boolean read = false;

    // === Constructores ===
    public Notification() {}

    public Notification(User user, String message, String link) {
        this.user = user;
        this.message = message;
        this.link = link;
        this.read = false;
    }

    // === Getters y Setters ===
    public String getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public Boolean getRead() { return read; }
    public void setRead(Boolean read) { this.read = read; }
}

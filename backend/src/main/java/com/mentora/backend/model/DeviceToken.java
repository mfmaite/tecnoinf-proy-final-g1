package com.mentora.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "device_tokens",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_device_token_token", columnNames = {"token"})
    }
)
public class DeviceToken {

    @Id
    private String id = UUID.randomUUID().toString();

    @ManyToOne(optional = false)
    @JoinColumn(name = "userCi", referencedColumnName = "ci", nullable = false)
    private User user;

    @Column(nullable = false, length = 2048)
    private String token;

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public DeviceToken() {}

    public DeviceToken(User user, String token) {
        this.user = user;
        this.token = token;
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}



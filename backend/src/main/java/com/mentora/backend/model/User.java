package com.mentora.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(nullable = false, unique = true)
    private String ci; // Cédula de identidad, será la PK

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String description;

    private String pictureUrl;

    @Enumerated(EnumType.STRING)
    private Role role; // ADMIN, PROFESOR, ESTUDIANTE

    // === Constructores ===
    public User() {}

    public User(String ci, String name, String email, String password, String description, String pictureUrl, Role role) {
        this.ci = ci;
        this.name = name;
        this.email = email;
        this.password = password;
        this.description = description;
        this.pictureUrl = pictureUrl;
        this.role = role; // ADMIN, PROFESOR, ESTUDIANTE
    }

    // === Getters y Setters ===
    public String getCi() {
        return ci;
    }

    public void setCi(String ci) {
        this.ci = ci;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPictureUrl() {
        return pictureUrl;
    }

    public void setPictureUrl(String pictureUrl) {
        this.pictureUrl = pictureUrl;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}

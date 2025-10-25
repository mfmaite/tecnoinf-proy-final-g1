package com.mentora.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Forums")
public class Forum {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(length = 20, nullable = false, unique = true)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ForumType type;

    @ManyToOne(optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // === Constructores ===
    public Forum() {}

    public Forum(String id, ForumType type, Course course) {
        this.id = id;
        this.type = type;
        this.course = course;
        this.createdAt = LocalDateTime.now();
    }

    // === Getters y Setters ===
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public ForumType getType() { return type; }
    public void setType(ForumType type) { this.type = type; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

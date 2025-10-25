package com.mentora.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Forums")
public class Forum {

    @Id
    @Column
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ForumType type;

    @ManyToOne(optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @OneToMany(mappedBy = "forum", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts; // posts del foro

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Forum() {}

    public Forum(String id, ForumType type, Course course) {
        this.type = type;
        this.course = course;
        this.createdAt = LocalDateTime.now();
    }

    // Getters y setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public ForumType getType() { return type; }
    public void setType(ForumType type) { this.type = type; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public List<Post> getPosts() { return posts; }
    public void setPosts(List<Post> posts) { this.posts = posts; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

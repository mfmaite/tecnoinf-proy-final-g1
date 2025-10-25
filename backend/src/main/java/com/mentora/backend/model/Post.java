package com.mentora.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "forum_id", nullable = false)
    private Forum forum;

    @ManyToOne(optional = false)
    @JoinColumn(name = "author_ci", nullable = false)
    private User author;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message; // antes content

    @Column(nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    public Post() {}

    public Post(Forum forum, User author, String message) {
        this.forum = forum;
        this.author = author;
        this.message = message;
        this.createdDate = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Forum getForum() { return forum; }
    public void setForum(Forum forum) { this.forum = forum; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}

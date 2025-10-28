package com.mentora.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, unique = true)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    @ManyToOne(optional = false)
    @JoinColumn(name = "forumId", referencedColumnName = "id", nullable = false)
    private Forum forum;

    @ManyToOne(optional = false)
    @JoinColumn(name = "authorCi", referencedColumnName = "ci", nullable = false)
    private User author;

    public Post() {}

    public Post(Forum forum, User author, String message) {
        this.forum = forum;
        this.author = author;
        this.message = message;
        this.createdDate = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Forum getForum() { return forum; }
    public void setForum(Forum forum) { this.forum = forum; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}

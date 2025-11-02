package com.mentora.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PostResponse")
public class PostResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, unique = true)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    @ManyToOne(optional = false)
    @JoinColumn(name = "authorId")
    private User author;

    @ManyToOne(optional = false)
    @JoinColumn(name = "postId")
    private Post post;

    // constructores, getters y setters

    public PostResponse() {}

    public PostResponse(String message, User author, Post post) {
        this.message = message;
        this.author = author;
        this.post = post;
        this.createdDate = LocalDateTime.now();
    }

    public Long getId() {return id;}
    public String getMessage() {return message;}
    public LocalDateTime getCreatedDate() {return createdDate;}
    public User getAuthor() {return author;}
    public Post getPost() {return post;}

    public void setId(Long id) {this.id = id;}
    public void setMessage(String message) {this.message = message;}
    public void setCreatedDate(LocalDateTime createdDate) {this.createdDate = createdDate;}
    public void setAuthor(User author) {this.author = author;}
    public void setPost(Post post) {this.post = post;}
}

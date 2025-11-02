package com.mentora.backend.dt;

import java.time.LocalDateTime;

public class DtPost {
    private Long id;
    private String authorCi;
    private String authorName;
    private String authorPictureUrl;
    private String message;
    private LocalDateTime createdDate;

    public DtPost() {}

    public DtPost(Long id, String authorCi, String authorName, String authorPictureUrl, String message, LocalDateTime createdDate) {
        this.id = id;
        this.authorCi = authorCi;
        this.authorName = authorName;
        this.message = message;
        this.createdDate = createdDate;
        this.authorPictureUrl = authorPictureUrl;
    }

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAuthorCi() { return authorCi; }
    public void setAuthorCi(String authorCi) { this.authorCi = authorCi; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public String getAuthorPictureUrl() { return authorPictureUrl; }
    public void setAuthorPictureUrl(String authorPictureUrl) { this.authorPictureUrl = authorPictureUrl; }
}

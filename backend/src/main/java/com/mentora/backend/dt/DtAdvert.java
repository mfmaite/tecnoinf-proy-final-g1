package com.mentora.backend.dto;

import java.time.LocalDateTime;

public class DtAdvert {

    private Long id;
    private String authorCi;
    private String authorName;
    private String courseId;
    private String content;
    private LocalDateTime createdAt;

    // === Constructores ===
    public DtAdvert() {}

    public DtAdvert(Long id, String authorCi, String authorName, String courseId, String content, LocalDateTime createdAt) {
        this.id = id;
        this.authorCi = authorCi;
        this.authorName = authorName;
        this.courseId = courseId;
        this.content = content;
        this.createdAt = createdAt;
    }

    // === Getters y Setters ===
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAuthorCi() {
        return authorCi;
    }

    public void setAuthorCi(String authorCi) {
        this.authorCi = authorCi;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

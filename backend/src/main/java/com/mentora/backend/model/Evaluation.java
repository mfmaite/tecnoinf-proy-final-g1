package com.mentora.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Evaluation")
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "createdDate")
    private LocalDateTime createdDate = LocalDateTime.now();

    @Lob
    @Column(name = "content", columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "fileUrl", length = 2048)
    private String fileUrl;

    @Column(name = "fileName", length = 255)
    private String fileName;

    @Column(name = "expirationDate")
    private LocalDateTime expirationDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "courseId", referencedColumnName = "id")
    private Course course;

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public String getContent() { return content; }
    public String getFileUrl() { return fileUrl; }
    public String getFileName() { return fileName; }
    public LocalDateTime getExpirationDate() { return expirationDate; }
    public Course getCourse() { return course; }

    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public void setContent(String content) { this.content = content; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setExpirationDate(LocalDateTime expirationDate) { this.expirationDate = expirationDate; }
    public void setCourse(Course course) { this.course = course; }
}

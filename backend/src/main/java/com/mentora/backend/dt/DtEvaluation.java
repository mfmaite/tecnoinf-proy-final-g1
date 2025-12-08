package com.mentora.backend.dt;

import java.time.LocalDateTime;

public class DtEvaluation {
    private Long id;
    private String title;
    private String content;
    private String fileName;
    private String fileUrl;
    private LocalDateTime createdDate;
    private String type;
    private LocalDateTime dueDate;
    private String courseId;

    public DtEvaluation() {}

    public DtEvaluation(Long id, String title, String content, String fileName, String fileUrl, LocalDateTime createdDate, LocalDateTime dueDate, String courseId) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.createdDate = createdDate;
        this.type = "evaluation";
        this.dueDate = dueDate;
        this.courseId = courseId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
}

package com.mentora.backend.dt;

import java.time.LocalDateTime;

public class DtQuiz {
    private Long id;
    private String title;
    private LocalDateTime dueDate;
    private String courseId;
    private LocalDateTime createdDate;
    private String type;

    public DtQuiz() {}

    public DtQuiz(Long id, String title, LocalDateTime dueDate, String courseId, LocalDateTime createdDate) {
        this.id = id;
        this.title = title;
        this.dueDate = dueDate;
        this.courseId = courseId;
        this.createdDate = createdDate;
        this.type = "quiz";
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public LocalDateTime getDueDate() { return dueDate; }
    public String getCourseId() { return courseId; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}

package com.mentora.backend.dt;

import java.time.LocalDateTime;

public class DtQuiz {
    private Long id;
    private String title;
    private LocalDateTime expirationDate;
    private String courseId;

    public DtQuiz(Long id, String title, LocalDateTime expirationDate, String courseId) {
        this.id = id;
        this.title = title;
        this.expirationDate = expirationDate;
        this.courseId = courseId;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public LocalDateTime getExpirationDate() { return expirationDate; }
    public String getCourseId() { return courseId; }
}

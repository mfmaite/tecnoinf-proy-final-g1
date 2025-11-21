package com.mentora.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Quiz")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime expirationDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", referencedColumnName = "id")
    private Course course;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizQuestion> questions = new ArrayList<>();

    public Quiz() {}

    public Quiz(String title, LocalDateTime expirationDate, Course course, List<QuizQuestion> questions) {
        this.title = title;
        this.expirationDate = expirationDate;
        this.course = course;
        this.questions = questions;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public LocalDateTime getExpirationDate() { return expirationDate; }
    public Course getCourse() { return course; }
    public List<QuizQuestion> getQuestions() { return questions; }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public void setExpirationDate(LocalDateTime expirationDate) {
        this.expirationDate = expirationDate;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public void setQuestions(List<QuizQuestion> questions) {
        this.questions = questions;
    }
}

package com.mentora.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "UserCourse")
public class UserCourse {

    @Id
    @Column(length = 20)
    private String id; // Generado manualmente, por ejemplo UUID

    @ManyToOne(optional = false)
    @JoinColumn(name = "courseId", referencedColumnName = "id")
    private Course course;

    @ManyToOne(optional = false)
    @JoinColumn(name = "userId", referencedColumnName = "ci")
    private User user;

    @Column(name = "finalGrade")
    private Integer finalGrade;

    public UserCourse() {
        this.id = java.util.UUID.randomUUID().toString();
    }

    public UserCourse(Course course, User user, Integer finalGrade) {
        this();
        this.course = course;
        this.user = user;
        this.finalGrade = finalGrade;
    }

    public String getId() { return id; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getFinalGrade() { return finalGrade; }
    public void setFinalGrade(Integer finalGrade) { this.finalGrade = finalGrade; }
}


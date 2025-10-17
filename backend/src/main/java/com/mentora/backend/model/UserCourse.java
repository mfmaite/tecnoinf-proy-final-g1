package com.mentora.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "UserCourse")
public class UserCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "courseId", referencedColumnName = "id")
    private Course course;

    @ManyToOne(optional = false)
    @JoinColumn(name = "userId", referencedColumnName = "ci")
    private User user;

    @Column(name = "finalGrade")
    private Double finalGrade;

    public UserCourse() {}

    public UserCourse(Course course, User user, Double finalGrade) {
        this.course = course;
        this.user = user;
        this.finalGrade = finalGrade;
    }

    public Long getId() { return id; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Double getFinalGrade() { return finalGrade; }
    public void setFinalGrade(Double finalGrade) { this.finalGrade = finalGrade; }
  }

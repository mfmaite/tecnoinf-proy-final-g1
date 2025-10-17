package com.mentora.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_courses")
public class UserCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "final_grade")
    private Double finalGrade;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role; // PROFESOR o ESTUDIANTE

    public UserCourse() {}

    public UserCourse(Course course, User user, Role role) {
        this.course = course;
        this.user = user;
        this.role = role;
    }

    // Getters y setters
    public Long getId() { return id; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Double getFinalGrade() { return finalGrade; }
    public void setFinalGrade(Double finalGrade) { this.finalGrade = finalGrade; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}

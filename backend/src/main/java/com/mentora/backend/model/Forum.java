package com.mentora.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Forums")
public class Forum {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, unique = true)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ForumType type;

    @ManyToOne(optional = false)
    @JoinColumn(name = "courseId", referencedColumnName = "id", nullable = false)
    private Course course;

    public Forum() {}

    public Forum(ForumType type, Course course) {
        this.type = type;
        this.course = course;
    }

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ForumType getType() { return type; }
    public void setType(ForumType type) { this.type = type; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
}

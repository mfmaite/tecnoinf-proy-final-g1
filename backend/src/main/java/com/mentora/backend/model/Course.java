package com.mentora.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Courses")
public class Course {
    @Id
    @Column(length = 10, nullable = false, unique = true)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "createdDate")
    private LocalDateTime createdDate = LocalDateTime.now();

    // Constructores, getters y setters
    public Course() {}

    public Course(String id, String name, LocalDateTime createdDate) { this.id = id; this.name = name; this.createdDate = createdDate; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}

package com.mentora.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    // Lista de foros
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Forum> forums = new ArrayList<>();

    // Constructores
    public Course() {}

    public Course(String id, String name, LocalDateTime createdDate) {
        this.id = id;
        this.name = name;
        this.createdDate = createdDate;
    }

    // Getters y setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public List<Forum> getForums() { return forums; }
    public void setForums(List<Forum> forums) { this.forums = forums; }

    public void addForum(Forum forum) {
        forums.add(forum);
        forum.setCourse(this);
    }

    public void removeForum(Forum forum) {
        forums.remove(forum);
        forum.setCourse(null);
    }
}

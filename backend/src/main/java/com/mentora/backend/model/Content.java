package com.mentora.backend.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contents")
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Lob
    private String markup;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContentType type;

    private Instant dueDate;
    private Instant createdAt = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_ci")
    private User creator; // profesor que lo creó

    @OneToMany(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FileResource> files = new ArrayList<>();

    @OneToMany(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizQuestion> questions = new ArrayList<>();

    // ====== Getters y Setters ======
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMarkup() { return markup; }
    public void setMarkup(String markup) { this.markup = markup; }

    public ContentType getType() { return type; }
    public void setType(ContentType type) { this.type = type; }

    public Instant getDueDate() { return dueDate; }
    public void setDueDate(Instant dueDate) { this.dueDate = dueDate; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public User getCreator() { return creator; }
    public void setCreator(User creator) { this.creator = creator; }

    public List<FileResource> getFiles() { return files; }
    public void setFiles(List<FileResource> files) { this.files = files; }

    public List<QuizQuestion> getQuestions() { return questions; }
    public void setQuestions(List<QuizQuestion> questions) { this.questions = questions; }
}

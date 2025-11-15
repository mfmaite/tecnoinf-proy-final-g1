package com.mentora.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Evaluation")
public class Evaluation {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 255)
  private String title;

  @Column(name = "createdDate")
  private LocalDateTime createdDate = LocalDateTime.now();

  @Column(name = "fileName")
  private String fileName;

  @Column(name = "fileUrl", length = 2048)
  private String fileUrl;

  @Lob
  @Column(name = "content", columnDefinition = "LONGTEXT")
  private String content;

  @ManyToOne(optional = false)
  @JoinColumn(name = "courseId", referencedColumnName = "id")
  private Course course;

  @Column(name = "dueDate")
  private LocalDateTime dueDate;

  @Column(name = "notified24hs")
  private boolean notified;

  public Evaluation() {}

  public Evaluation(String title, Course course, String fileName, String fileUrl, String content, LocalDateTime dueDate) {
    this.title = title;
    this.course = course;
    this.fileName = fileName;
    this.fileUrl = fileUrl;
    this.content = content;
    this.dueDate = dueDate;
    this.notified = false;
  }

  // ====== Getters y Setters ======
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }

  public String getContent() { return content; }
  public void setContent(String content) { this.content = content; }

  public Course getCourse() { return course; }
  public void setCourse(Course course) { this.course = course; }

  public LocalDateTime getCreatedDate() { return createdDate; }
  public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

  public String getFileName() { return fileName; }
  public void setFileName(String fileName) { this.fileName = fileName; }

  public String getFileUrl() { return fileUrl; }
  public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

  public LocalDateTime getDueDate() { return dueDate; }
  public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

  public boolean isNotified() { return notified; }
  public void setNotified(boolean notified) { this.notified = notified; }
}

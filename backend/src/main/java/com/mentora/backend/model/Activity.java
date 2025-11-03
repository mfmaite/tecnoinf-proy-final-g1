package com.mentora.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Activity")
public class Activity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ActivityType type;

  @Column(nullable = true)
  private String description;

  @Column(nullable = false)
  private String link;

  @Column(nullable = false)
  private LocalDateTime createdDate = LocalDateTime.now();

  @ManyToOne(optional = false)
  @JoinColumn(name = "userId", referencedColumnName = "ci")
  private User user;

  public Activity() {}

  public Activity(ActivityType type, String description, String link, User user) {
    this.type = type;
    this.description = description;
    this.link = link;
    this.user = user;
    this.createdDate = LocalDateTime.now();
  }

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public ActivityType getType() { return type; }
  public void setType(ActivityType type) { this.type = type; }

  public String getDescription() { return description; }
  public void setDescription(String description) { this.description = description; }

  public String getLink() { return link; }
  public void setLink(String link) { this.link = link; }

  public LocalDateTime getCreatedDate() { return createdDate; }
  public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

  public User getUser() { return user; }
  public void setUser(User user) { this.user = user; }
}

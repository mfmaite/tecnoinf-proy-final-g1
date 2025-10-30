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
}

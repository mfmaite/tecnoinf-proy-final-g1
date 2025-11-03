package com.mentora.backend.dt;

import java.time.LocalDateTime;
import com.mentora.backend.model.ActivityType;

public class DtActivity {
  private Long id;
  private ActivityType type;
  private String description;
  private String link;
  private LocalDateTime createdDate;

  public DtActivity() {}

  public DtActivity(Long id, ActivityType type, String description, String link, LocalDateTime createdDate) {
    this.id = id;
    this.type = type;
    this.description = description;
    this.link = link;
    this.createdDate = createdDate;
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
}

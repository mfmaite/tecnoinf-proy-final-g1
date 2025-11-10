package com.mentora.backend.requests;

import java.time.LocalDateTime;

import org.springframework.web.multipart.MultipartFile;

public class CreateEvaluationRequest {
  public String title;
  public String content;
  public MultipartFile file;
  public LocalDateTime dueDate;

  public CreateEvaluationRequest() {}

  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }
  public String getContent() { return content; }
  public void setContent(String content) { this.content = content; }
  public MultipartFile getFile() { return file; }
  public void setFile(MultipartFile file) { this.file = file; }
  public LocalDateTime getDueDate() { return dueDate; }
  public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
}

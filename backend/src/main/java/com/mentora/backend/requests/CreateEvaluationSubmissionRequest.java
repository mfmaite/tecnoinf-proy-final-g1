package com.mentora.backend.requests;

import org.springframework.web.multipart.MultipartFile;

public class CreateEvaluationSubmissionRequest {
  public String solution;
  public MultipartFile file;

  public CreateEvaluationSubmissionRequest() {}

  public String getSolution() { return solution; }
  public void setSolution(String solution) { this.solution = solution; }
  public MultipartFile getFile() { return file; }
  public void setFile(MultipartFile file) { this.file = file; }
}

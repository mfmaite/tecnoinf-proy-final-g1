package com.mentora.backend.responses;

public class QuizAnswerResponse {
  private Long id;
  private String text;
  private Boolean correct;

  public QuizAnswerResponse(Long id, String text, Boolean correct) {
    this.id = id;
    this.text = text;
    this.correct = correct;
  }

  public Long getId() {
    return id;
  }

  public String getText() {
    return text;
  }

  public Boolean getCorrect() {
    return correct;
  }
}



package com.mentora.backend.responses;

import java.util.List;

public class QuizQuestionResponse {
  private Long id;
  private String question;
  private List<QuizAnswerResponse> answers;

  public QuizQuestionResponse(Long id, String question, List<QuizAnswerResponse> answers) {
    this.id = id;
    this.question = question;
    this.answers = answers;
  }

  public Long getId() {
    return id;
  }

  public String getQuestion() {
    return question;
  }

  public List<QuizAnswerResponse> getAnswers() {
    return answers;
  }
}



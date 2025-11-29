package com.mentora.backend.requests;

import java.util.List;

public class CreateQuizSubmissionRequest {
  private List<Long> answerIds;

  public CreateQuizSubmissionRequest() {}

  public List<Long> getAnswerIds() { return answerIds; }
  public void setAnswerIds(List<Long> answerIds) { this.answerIds = answerIds; }
}



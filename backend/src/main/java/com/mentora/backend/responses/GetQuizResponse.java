package com.mentora.backend.responses;

import java.util.List;
import com.mentora.backend.dt.DtQuiz;

public class GetQuizResponse {
  private DtQuiz quiz;
  private List<QuizQuestionResponse> questions;

  public GetQuizResponse(DtQuiz quiz, List<QuizQuestionResponse> questions) {
    this.quiz = quiz;
    this.questions = questions;
  }

  public DtQuiz getQuiz() {
    return quiz;
  }

  public List<QuizQuestionResponse> getQuestions() {
    return questions;
  }
}



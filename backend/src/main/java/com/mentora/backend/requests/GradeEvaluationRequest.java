package com.mentora.backend.requests;

public class GradeEvaluationRequest {
  private Integer grade;
  private String studentCi;

  public GradeEvaluationRequest() {}

  public Integer getGrade() {
    return grade;
  }

  public void setGrade(Integer grade) {
    this.grade = grade;
  }

  public String getStudentCi() {
    return studentCi;
  }

  public void setStudentCi(String studentCi) {
    this.studentCi = studentCi;
  }
}


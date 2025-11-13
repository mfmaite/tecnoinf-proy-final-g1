package com.mentora.backend.responses;

import java.util.List;
import com.mentora.backend.dt.DtEvaluation;
import com.mentora.backend.dt.DtEvaluationSubmission;

public class GetEvaluationWithSubmissionResponse {
  private DtEvaluation evaluation;
  private List<DtEvaluationSubmission> submissions;

  public GetEvaluationWithSubmissionResponse(DtEvaluation evaluation, List<DtEvaluationSubmission> submissions) {
    this.evaluation = evaluation;
    this.submissions = submissions;
  }

  public DtEvaluation getEvaluation() { return evaluation; }
  public List<DtEvaluationSubmission> getSubmissions() { return submissions; }
}

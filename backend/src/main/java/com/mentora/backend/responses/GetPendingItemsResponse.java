package com.mentora.backend.responses;

import com.mentora.backend.dt.DtEvaluation;
import com.mentora.backend.dt.DtQuiz;
import java.util.List;

public class GetPendingItemsResponse {
    private List<DtEvaluation> evaluations;
    private List<DtQuiz> quizzes;

    public GetPendingItemsResponse() {}

    public GetPendingItemsResponse(List<DtEvaluation> evaluations, List<DtQuiz> quizzes) {
        this.evaluations = evaluations;
        this.quizzes = quizzes;
    }

    public List<DtEvaluation> getEvaluations() {
        return evaluations;
    }

    public void setEvaluations(List<DtEvaluation> evaluations) {
        this.evaluations = evaluations;
    }

    public List<DtQuiz> getQuizzes() {
        return quizzes;
    }

    public void setQuizzes(List<DtQuiz> quizzes) {
        this.quizzes = quizzes;
    }
}



package com.mentora.backend.requests;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UpdateQuizRequest {
    private String title;
    private LocalDateTime dueDate;

    private List<Long> removeQuestionIds;

    private List<QuestionUpdateDTO> questions;

    @Data
    public static class QuestionUpdateDTO {
        private Long id;
        private String question;
        private List<Long> removeAnswerIds;
        private List<AnswerUpdateDTO> answers;
    }

    @Data
    public static class AnswerUpdateDTO {
        private Long id;
        private String text;
        private Boolean correct;
    }
}



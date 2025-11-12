package com.mentora.backend.requests;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateQuizRequest {

    @NotNull
    @Size(max = 255)
    private String title;

    @NotNull
    private LocalDateTime dueDate;

    @NotEmpty
    private List<QuestionDTO> questions;

    @Data
    public static class QuestionDTO {

        @NotBlank
        @Size(max = 255)
        private String question;

        @NotEmpty
        private List<AnswerDTO> answers;
    }

    @Data
    public static class AnswerDTO {

        @NotBlank
        private String text;

        private boolean correct;
    }
}

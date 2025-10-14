package com.mentora.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class QuizQuestionDto {

    public String questionText;
    public List<QuizAnswerDto> answers = new ArrayList<>();

    public QuizQuestionDto() {}
}

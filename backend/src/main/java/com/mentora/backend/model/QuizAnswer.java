package com.mentora.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "QuizAnswer")
public class QuizAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String answerText;

    @Column(nullable = false)
    private Boolean correct;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    public QuizAnswer() {}

    public QuizAnswer(Long id, String answerText, Boolean correct, QuizQuestion question) {
        this.id = id;
        this.answerText = answerText;
        this.correct = correct;
        this.question = question;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getAnswerText() {
        return answerText;
    }
    public void setAnswerText(String answerText) {
        this.answerText = answerText;
    }
    public Boolean getCorrect() {
        return correct;
    }
    public void setCorrect(Boolean correct) {
        this.correct = correct;
    }
    public QuizQuestion getQuestion() {
        return question;
    }
    public void setQuestion(QuizQuestion question) {
        this.question = question;
    }
}

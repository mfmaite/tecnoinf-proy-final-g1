package com.mentora.backend.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "QuizQuestion")
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String questionText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizAnswer> answers = new ArrayList<>();

    public QuizQuestion() {}

    public QuizQuestion(String questionText, Quiz quiz,  List<QuizAnswer> answers) {
        this.questionText = questionText;
        this.quiz = quiz;
        this.answers = answers;
        for (QuizAnswer a : answers) {
            a.setQuestion(this);
        }
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }
    public String getQuestionText() {
        return questionText;
    }
    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }
    public Quiz getQuiz() {
        return quiz;
    }
    public List<QuizAnswer> getAnswers() {
        return answers;
    }
    public void setAnswers(List<QuizAnswer> answers) {
        this.answers = answers;
        for (QuizAnswer a : answers) {
            a.setQuestion(this);
        }
    }

    public void addAnswer(QuizAnswer answer) {
        answers.add(answer);
        answer.setQuestion(this);
    }

    public void removeAnswer(QuizAnswer answer) {
        answers.remove(answer);
        answer.setQuestion(null);
    }
}

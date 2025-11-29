package com.mentora.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "QuizSubmission")
public class QuizSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(name = "answers")
    private String answers;

    @Column(name = "note")
    private Integer note;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", referencedColumnName = "id", nullable = false)
    private Quiz quiz;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "authorCi", referencedColumnName = "ci", nullable = false)
    private User author;

    public QuizSubmission() {}

    public QuizSubmission(String answers, Integer note, Quiz quiz, User author) {
        this.answers = answers;
        this.note = note;
        this.quiz = quiz;
        this.author = author;
    }

    public Long getId() { return id; }
    public String getAnswers() { return answers; }
    public Integer getNote() { return note; }
    public Quiz getQuiz() { return quiz; }
    public User getAuthor() { return author; }

    public void setId(Long id) { this.id = id; }
    public void setAnswers(String answers) { this.answers = answers; }
    public void setNote(Integer note) { this.note = note; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }
    public void setAuthor(User author) { this.author = author; }
}



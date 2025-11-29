package com.mentora.backend.dt;

import java.util.List;

public class DtQuizSubmission {
    private Long id;
    private List<Long> answerIds;
    private Integer note;
    private DtUser author;
    private DtQuiz quiz;
    private String type;

    public DtQuizSubmission() {}

    public DtQuizSubmission(Long id, List<Long> answerIds, Integer note, DtUser author, DtQuiz quiz) {
        this.id = id;
        this.answerIds = answerIds;
        this.note = note;
        this.author = author;
        this.quiz = quiz;
        this.type = "quiz";
    }

    public Long getId() { return id; }
    public List<Long> getAnswerIds() { return answerIds; }
    public Integer getNote() { return note; }
    public DtUser getAuthor() { return author; }
    public DtQuiz getQuiz() { return quiz; }
    public String getType() { return type; }

    public void setId(Long id) { this.id = id; }
    public void setAnswerIds(List<Long> answerIds) { this.answerIds = answerIds; }
    public void setNote(Integer note) { this.note = note; }
    public void setAuthor(DtUser author) { this.author = author; }
    public void setQuiz(DtQuiz quiz) { this.quiz = quiz; }
    public void setType(String type) { this.type = type; }
}



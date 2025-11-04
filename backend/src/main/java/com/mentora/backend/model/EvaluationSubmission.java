package com.mentora.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "EvaluationSubmission")
public class EvaluationSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(name = "solution")
    private String solution;

    @Column(name = "fileName", length = 255)
    private String fileName;

    @Column(name = "note")
    private Integer note;

    @ManyToOne(optional = false)
    @JoinColumn(name = "evaluationId", referencedColumnName = "id")
    private Evaluation evaluation;

    @ManyToOne(optional = false)
    @JoinColumn(name = "authorCi", referencedColumnName = "ci")
    private User author;

    public EvaluationSubmission() {}

    public EvaluationSubmission(String solution, String fileName, Integer note, Evaluation evaluation, User author) {
        this.solution = solution;
        this.fileName = fileName;
        this.note = note;
        this.evaluation = evaluation;
        this.author = author;
    }

    public Long getId() { return id; }
    public String getSolution() { return solution; }
    public String getFileName() { return fileName; }
    public Integer getNote() { return note; }
    public Evaluation getEvaluation() { return evaluation; }
    public User getAuthor() { return author; }

    public void setId(Long id) { this.id = id; }
    public void setSolution(String solution) { this.solution = solution; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setNote(Integer note) { this.note = note; }
    public void setEvaluation(Evaluation evaluation) { this.evaluation = evaluation; }
    public void setAuthor(User author) { this.author = author; }
}

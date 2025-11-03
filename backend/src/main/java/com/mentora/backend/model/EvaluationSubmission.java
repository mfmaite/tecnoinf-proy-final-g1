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

    @Column(name = "fileUrl", length = 2048)
    private String fileUrl;

    @Column(name = "fileName", length = 255)
    private String fileName;

    @Column(name = "note")
    private Double note;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evaluationId", referencedColumnName = "id")
    private Evaluation evaluation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "authorId", referencedColumnName = "id")
    private User author;

    public Long getId() { return id; }
    public String getSolution() { return solution; }
    public String getFileUrl() { return fileUrl; }
    public String getFileName() { return fileName; }
    public Double getNote() { return note; }
    public Evaluation getEvaluation() { return evaluation; }
    public User getAuthor() { return author; }

    public void setId(Long id) { this.id = id; }
    public void setSolution(String solution) { this.solution = solution; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setNote(Double note) { this.note = note; }
    public void setEvaluation(Evaluation evaluation) { this.evaluation = evaluation; }
    public void setAuthor(User author) { this.author = author; }
}

package com.mentora.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "evaluation_submissions")
public class EvaluationSubmission {

    @Id
    private String id;

    @Lob
    private String solution; // markup de la entrega del estudiante

    private String fileUrl; // URL del archivo subido
    private String fileName; // nombre original del archivo

    private Integer note; // nota, inicialmente null hasta que el profesor califique

    private Instant submittedAt = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evaluation_id")
    private Content evaluation; // la evaluación asociada

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_ci")
    private User student;

    // ====== Getters y Setters ======
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSolution() { return solution; }
    public void setSolution(String solution) { this.solution = solution; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Integer getNote() { return note; }
    public void setNote(Integer note) { this.note = note; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public Content getEvaluation() { return evaluation; }
    public void setEvaluation(Content evaluation) { this.evaluation = evaluation; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
}


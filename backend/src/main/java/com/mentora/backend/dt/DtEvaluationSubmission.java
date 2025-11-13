package com.mentora.backend.dt;

public class DtEvaluationSubmission {
    private Long id;
    private String fileName;
    private String fileUrl;
    private Integer note;
    private DtUser author;
    private DtEvaluation evaluation;

    public DtEvaluationSubmission() {}

    public DtEvaluationSubmission(Long id, String fileName, String fileUrl, Integer note, DtUser author, DtEvaluation evaluation) {
        this.id = id;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.note = note;
        this.author = author;
        this.evaluation = evaluation;
    }

    public Long getId() { return id; }
    public String getFileName() { return fileName; }
    public String getFileUrl() { return fileUrl; }
    public Integer getNote() { return note; }
    public DtUser getAuthor() { return author; }
    public DtEvaluation getEvaluation() { return evaluation; }

    public void setId(Long id) { this.id = id; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public void setNote(Integer note) { this.note = note; }
    public void setAuthor(DtUser author) { this.author = author; }
    public void setEvaluation(DtEvaluation evaluation) { this.evaluation = evaluation; }
}

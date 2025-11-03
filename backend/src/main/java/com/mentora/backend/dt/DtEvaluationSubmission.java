package com.mentora.backend.dt;

public class DtEvaluationSubmission {
    private Long id;
    private String fileName;
    private String fileUrl;
    private Double note;
    private Long authorId;

    public Long getId() { return id; }
    public String getFileName() { return fileName; }
    public String getFileUrl() { return fileUrl; }
    public Double getNote() { return note; }
    public Long getAuthorId() { return authorId; }

    public void setId(Long id) { this.id = id; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public void setNote(Double note) { this.note = note; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
}

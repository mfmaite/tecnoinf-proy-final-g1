package com.mentora.backend.requests;

import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;

public class EditEvaluationRequest {

    private String title;
    private String content;
    private LocalDateTime dueDate;

    // Archivo opcional para reemplazar el existente
    private MultipartFile file;

    // Flag opcional para eliminar el archivo actual
    private Boolean clearFile = false;

    public EditEvaluationRequest() {}

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }

    public Boolean getClearFile() {
        return clearFile;
    }

    public void setClearFile(Boolean clearFile) {
        this.clearFile = clearFile;
    }
}

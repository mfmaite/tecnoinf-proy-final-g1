package com.mentora.backend.dto;

import java.time.Instant;
import java.util.List;

import com.mentora.backend.model.ContentType;

public class CreateContentRequest {

    public String title;                     // Título obligatorio, máximo 255 caracteres
    public String markup;                    // Texto enriquecido, obligatorio para SIMPLE
    public ContentType type;                 // Tipo de contenido: SIMPLE, FILE, EVALUATION, QUIZ
    public Instant dueDate;                  // Obligatorio solo para EVALUATION o QUIZ
    public List<QuizQuestionDto> questions; // Solo para QUIZ
    public boolean hasFile;                  // Indica si se envía archivo junto al contenido

    // Constructor vacío
    public CreateContentRequest() {}

    // Getters y setters (opcional, si usás Lombok podés agregar @Data)
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMarkup() { return markup; }
    public void setMarkup(String markup) { this.markup = markup; }

    public ContentType getType() { return type; }
    public void setType(ContentType type) { this.type = type; }

    public Instant getDueDate() { return dueDate; }
    public void setDueDate(Instant dueDate) { this.dueDate = dueDate; }

    public List<QuizQuestionDto> getQuestions() { return questions; }
    public void setQuestions(List<QuizQuestionDto> questions) { this.questions = questions; }

    public boolean isHasFile() { return hasFile; }
    public void setHasFile(boolean hasFile) { this.hasFile = hasFile; }
}

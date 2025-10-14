package com.mentora.backend.model;

public enum ContentType {
    SIMPLE,      // Texto enriquecido
    FILE,        // Solo un archivo
    EVALUATION,  // Evaluación con fecha de vencimiento, puede incluir archivo y/o contenido
    QUIZ         // Prueba de preguntas y respuestas onda multiple opcion
}

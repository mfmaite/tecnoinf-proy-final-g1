package com.mentora.backend.dto;

public class CreateCourseRequest {
    private String id;
    private String name;
    private String[] professorsCis;

    public CreateCourseRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String[] getProfessorsCis() { return professorsCis; }
    public void setProfessorsCis(String[] professorsCis) { this.professorsCis = professorsCis; }
}


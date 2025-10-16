package com.mentora.backend.dto;

import java.util.Set;

public class CreateCourseRequest {
    private String id; // el usuario lo envía
    private String name;
    private Set<String> professorCis;
    private Set<String> studentCis;

    public CreateCourseRequest() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Set<String> getProfessorCis() { return professorCis; }
    public void setProfessorCis(Set<String> professorCis) { this.professorCis = professorCis; }

    public Set<String> getStudentCis() { return studentCis; }
    public void setStudentCis(Set<String> studentCis) { this.studentCis = studentCis; }
}

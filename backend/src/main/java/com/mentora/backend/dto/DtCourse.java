package com.mentora.backend.dto;

import java.time.LocalDateTime;
import java.util.Set;

public class DtCourse {
    private Long id;
    private String name;
    private LocalDateTime creationDate;
    private Double grade;
    private Set<String> professorCis;
    private Set<String> studentCis;

    public DtCourse() {}

    public DtCourse(Long id, String name, LocalDateTime creationDate, Double grade,
                    Set<String> professorCis, Set<String> studentCis) {
        this.id = id;
        this.name = name;
        this.creationDate = creationDate;
        this.grade = grade;
        this.professorCis = professorCis;
        this.studentCis = studentCis;
    }

    // getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDateTime getCreationDate() { return creationDate; }
    public void setCreationDate(LocalDateTime creationDate) { this.creationDate = creationDate; }

    public Double getGrade() { return grade; }
    public void setGrade(Double grade) { this.grade = grade; }

    public Set<String> getProfessorCis() { return professorCis; }
    public void setProfessorCis(Set<String> professorCis) { this.professorCis = professorCis; }

    public Set<String> getStudentCis() { return studentCis; }
    public void setStudentCis(Set<String> studentCis) { this.studentCis = studentCis; }
}

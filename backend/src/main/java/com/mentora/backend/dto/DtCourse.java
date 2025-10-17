package com.mentora.backend.dto;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class DtCourse {
    private String id;
    private String name;
    private LocalDateTime creationDate;
    private Set<String> professorCis;
    private Set<String> studentCis;

    public DtCourse() {
        this.professorCis = new HashSet<>();
        this.studentCis = new HashSet<>();
    }

    public DtCourse(String id, String name, LocalDateTime creationDate,
                    Set<String> professorCis, Set<String> studentCis) {
        this.id = id;
        this.name = name;
        this.creationDate = creationDate;
        this.professorCis = professorCis != null ? new HashSet<>(professorCis) : new HashSet<>();
        this.studentCis = studentCis != null ? new HashSet<>(studentCis) : new HashSet<>();
    }

    // Getters y setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDateTime getCreationDate() { return creationDate; }
    public void setCreationDate(LocalDateTime creationDate) { this.creationDate = creationDate; }

    public Set<String> getProfessorCis() { return Collections.unmodifiableSet(professorCis); }
    public void setProfessorCis(Set<String> professorCis) {
        this.professorCis = professorCis != null ? new HashSet<>(professorCis) : new HashSet<>();
    }

    public Set<String> getStudentCis() { return Collections.unmodifiableSet(studentCis); }
    public void setStudentCis(Set<String> studentCis) {
        this.studentCis = studentCis != null ? new HashSet<>(studentCis) : new HashSet<>();
    }
}

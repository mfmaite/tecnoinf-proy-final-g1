package com.mentora.backend.dt;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class DtCourse {
    private String id;
    private String name;
    private LocalDateTime createdDate;
    private List<DtForum> forums = new ArrayList<>();

    public DtCourse() {}

    public DtCourse(String id, String name, LocalDateTime createdDate) {
        this.id = id;
        this.name = name;
        this.createdDate = createdDate;
    }

    // Getters y setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}

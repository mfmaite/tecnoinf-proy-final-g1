package com.mentora.backend.dt;

import java.time.LocalDateTime;
import java.util.List;

public class DtForum {
    private String id;
    private String type;
    private String courseId;
    private LocalDateTime createdAt;
    private List<DtPost> posts; // posts del foro

    public DtForum() {}

    public DtForum(String id, String type, String courseId, LocalDateTime createdAt, List<DtPost> posts) {
        this.id = id;
        this.type = type;
        this.courseId = courseId;
        this.createdAt = createdAt;
        this.posts = posts;
    }

    // Getters y setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<DtPost> getPosts() { return posts; }
    public void setPosts(List<DtPost> posts) { this.posts = posts; }
}

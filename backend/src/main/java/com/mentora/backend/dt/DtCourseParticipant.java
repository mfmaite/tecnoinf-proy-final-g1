package com.mentora.backend.dt;

import com.mentora.backend.model.Role;

public class DtCourseParticipant {
    private String ci;
    private String name;
    private String email;
    private String description;
    private String pictureUrl;
    private Role role;

    private Integer finalGrade; // null if not graded

    public DtCourseParticipant() {}

    public DtCourseParticipant(DtUser user, Integer finalGrade) {
        this.ci = user.getCi();
        this.name = user.getName();
        this.email = user.getEmail();
        this.description = user.getDescription();
        this.pictureUrl = user.getPictureUrl();
        this.role = user.getRole();
        this.finalGrade = finalGrade;
    }

    public String getCi() { return ci; }
    public void setCi(String ci) { this.ci = ci; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPictureUrl() { return pictureUrl; }
    public void setPictureUrl(String pictureUrl) { this.pictureUrl = pictureUrl; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Integer getFinalGrade() { return finalGrade; }
    public void setFinalGrade(Integer finalGrade) { this.finalGrade = finalGrade; }
}


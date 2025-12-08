package com.mentora.backend.requests;

import com.mentora.backend.model.Role;

import org.springframework.web.multipart.MultipartFile;

public class CreateUserRequest {
    private String ci;
    private String name;
    private String email;
    private String password;
    private String description;
    private MultipartFile profilePicture;
    private Role role;

    public String getCi() { return ci; }
    public void setCi(String ci) { this.ci = ci; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public MultipartFile getProfilePicture() { return profilePicture; }
    public void setProfilePicture(MultipartFile profilePicture) { this.profilePicture = profilePicture; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}


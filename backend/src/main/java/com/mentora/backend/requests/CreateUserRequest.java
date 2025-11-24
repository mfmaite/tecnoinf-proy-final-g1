package com.mentora.backend.requests;

public class CreateUserRequest {
    private String ci;
    private String name;
    private String lastName;
    private String email;
    private String password;
    private String role;

    public String getCi() { return ci; }
    public void setCi(String ci) { this.ci = ci; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}


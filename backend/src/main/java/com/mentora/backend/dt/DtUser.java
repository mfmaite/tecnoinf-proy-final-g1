package com.mentora.backend.dt;

import com.mentora.backend.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DtUser {

    @NotBlank(message = "La cédula es requerida")
    private String ci;

    @NotBlank(message = "El nombre es requerido")
    private String name;

    @NotBlank(message = "El email es requerido")
    @Email(message = "El email no es válido")
    private String email;

    @NotBlank(message = "La contraseña es requerida")
    private String password;

    private String description;
    private String pictureUrl;

    @NotNull(message = "El rol es requerido")
    private Role role;

    public DtUser() {}

    public DtUser(String ci, String name, String email, String description, String pictureUrl, Role role) {
        this.ci = ci;
        this.name = name;
        this.email = email;
        this.description = description;
        this.pictureUrl = pictureUrl;
        this.role = role;
    }

    // Getters y Setters
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

    public String getPictureUrl() { return pictureUrl; }
    public void setPictureUrl(String pictureUrl) { this.pictureUrl = pictureUrl; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}

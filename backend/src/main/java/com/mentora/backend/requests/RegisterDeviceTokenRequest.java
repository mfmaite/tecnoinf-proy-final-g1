package com.mentora.backend.requests;

import jakarta.validation.constraints.NotBlank;

public class RegisterDeviceTokenRequest {
    @NotBlank
    private String token;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}



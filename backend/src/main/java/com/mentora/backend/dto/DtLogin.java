package com.mentora.backend.dto;

public class DtLogin {
    private String ci;
    private String password;

    public DtLogin() {}

    public DtLogin(String ci, String password) {
        this.ci = ci;
        this.password = password;
    }

    public String getCi() {
        return ci;
    }

    public void setCi(String ci) {
        this.ci = ci;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}


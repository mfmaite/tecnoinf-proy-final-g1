package com.mentora.backend.dto;

public class DtLoginResponse {

    private String jwt;
    private DtUser user;

    public DtLoginResponse() {}

    public DtLoginResponse(String jwt, DtUser user) {
        this.jwt = jwt;
        this.user = user;
    }

    public String getJwt() { return jwt; }
    public void setJwt(String jwt) { this.jwt = jwt; }

    public DtUser getUser() { return user; }
    public void setUser(DtUser user) { this.user = user; }
}



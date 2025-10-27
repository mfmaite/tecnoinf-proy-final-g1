package com.mentora.backend.responses;

import com.mentora.backend.dt.DtUser;

public class LoginResponse {
  private DtUser user;
  private String token;

  public LoginResponse(DtUser user, String token) {
    this.user = user;
    this.token = token;
  }

  public DtUser getUser() {
    return user;
  }

  public String getToken() {
    return token;
  }
}

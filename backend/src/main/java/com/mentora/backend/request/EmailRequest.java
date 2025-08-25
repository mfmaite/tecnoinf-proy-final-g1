package com.mentora.backend.request;

public class EmailRequest {
  private String recipient;
  private String subject;
  private String body;

  public String getRecipient() {
    return recipient;
  }

  public String getSubject() {
    return subject;
  }

  public String getBody() {
    return body;
  }
}

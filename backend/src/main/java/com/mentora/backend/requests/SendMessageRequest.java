package com.mentora.backend.requests;

public class SendMessageRequest {
    private String recipientCi;
    private String message;

    public String getRecipientCi() { return recipientCi; }
    public void setRecipientCi(String recipientCi) { this.recipientCi = recipientCi; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}



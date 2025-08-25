package com.mentora.backend.dto;

public class ResponseDTO<T> {

    private boolean success;
    private int status;
    private String message;
    private T data;

    public ResponseDTO() {}

    public ResponseDTO(boolean success, int status, String message) {
        this.success = success;
        this.status = status;
        this.message = message;
    }

    public ResponseDTO(boolean success, int status, String message, T data) {
        this.success = success;
        this.status = status;
        this.message = message;
        this.data = data;
    }

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
}


package com.mentora.backend.dt;

import java.time.LocalDateTime;

public class DtPostResponse {
    private Long id;
    private String message;
    private LocalDateTime createdDate;
    private String authorCi;
    private String authorName;
    private Long postId;

    // constructores, getters y setters

    public DtPostResponse() {}

    public DtPostResponse(Long id, String message, LocalDateTime createdDate, String authorCi, String authorName, Long postId) {
        this.id = id;
        this.message = message;
        this.createdDate = createdDate;
        this.authorCi = authorCi;
        this.authorName = authorName;
        this.postId = postId;
    }

    public Long getId() {return id;}
    public String getMessage() {return message;}
    public LocalDateTime getCreatedDate() {return createdDate;}
    public String getAuthorCi() {return authorCi;}
    public String getAuthorName() {return authorName;}
    public Long getPostId() {return postId;}

    public void setId(Long id) {this.id = id;}
    public void setMessage(String message) {this.message = message;}
    public void setCreatedDate(LocalDateTime createdDate) {this.createdDate = createdDate;}
    public void setAuthorCi(String authorCi) {this.authorCi = authorCi;}
    public void setAuthorName(String authorName) {this.authorName = authorName;}
    public void setPostId(Long postId) {this.postId = postId;}
}

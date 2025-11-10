package com.mentora.backend.requests;

import org.springframework.lang.Nullable;
import org.springframework.web.multipart.MultipartFile;

public class UpdateUserRequest {
  @Nullable private String name;
  @Nullable private String email;
  @Nullable private String description;
  @Nullable private MultipartFile picture;

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getDescription() { return description; }
  public void setDescription(String description) { this.description = description; }
  public MultipartFile getPicture() { return picture; }
  public void setPicture(MultipartFile picture) { this.picture = picture; }
}

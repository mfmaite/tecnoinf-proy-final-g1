package com.mentora.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users", uniqueConstraints = {
  @UniqueConstraint(columnNames = "email")
})
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "name")
  private String name;

  @Column(name = "email")
  private String email;

  @Column(name = "password")
  private String password;

  // Constructors

  public User() {}

  public User(String name, String email, String password) {
    this.name = name;
    this.email = email;
    this.password = password;
  }

  // Getters and Setters
  public Long getId() { return id; }

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }

  public String getPassword() { return password; }
  public void setPassword(String password) { this.password = password; }

}

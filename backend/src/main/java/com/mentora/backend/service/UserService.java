package com.mentora.backend.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.mentora.backend.dto.UserDTO;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.UserRepository;

@Service
public class UserService {
  private final UserRepository userRepository;

  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public UserDTO createUser(UserDTO userDTO) {
    if (userDTO.getName() == null || userDTO.getEmail() == null || userDTO.getPassword() == null) {
      throw new RuntimeException("All fields are required");
    }

    if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
      throw new RuntimeException("Email already exists");
    }

    User user = new User();
    user.setName(userDTO.getName());
    user.setEmail(userDTO.getEmail());
    user.setPassword(userDTO.getPassword());

    userRepository.save(user);

    return new UserDTO(user.getName(), user.getEmail());
  }

  public Optional<User> getUserByEmail(String email) {
    return userRepository.findByEmail(email);
  }
}

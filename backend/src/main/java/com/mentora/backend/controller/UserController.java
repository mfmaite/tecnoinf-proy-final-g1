package com.mentora.backend.controller;

import com.mentora.backend.dto.ResponseDTO;
import com.mentora.backend.dto.UserDTO;
import com.mentora.backend.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping("/signup")
  public ResponseEntity<ResponseDTO<UserDTO>> createUser(@Valid @RequestBody UserDTO userDTO) {
    try {
      UserDTO createdUser = userService.createUser(userDTO);

      ResponseDTO<UserDTO> response = new ResponseDTO<>(
              true,
              HttpStatus.CREATED.value(),
              "El usuario se ha creado exitosamente",
              createdUser
      );

      return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (RuntimeException e) {
      ResponseDTO<UserDTO> response = new ResponseDTO<>(
                    false,
                    HttpStatus.BAD_REQUEST.value(),
                    e.getMessage(),
                    null
            );

      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
  }
}

package com.mentora.backend.controller;

import com.mentora.backend.dto.ResponseDTO;
import com.mentora.backend.dto.UserDTO;
import com.mentora.backend.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping("/signup")
    @Operation(summary = "Crear un nuevo usuario",
               description = "Crea un usuario con nombre, email y password")
    @ApiResponse(responseCode = "201", description = "Usuario creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos o email ya existente")
  public ResponseEntity<ResponseDTO<UserDTO>> createUser(@Valid @RequestBody UserDTO userDTO) {
    try {
      UserDTO createdUser = userService.createUser(userDTO);

      ResponseDTO<UserDTO> response = new ResponseDTO<>(
              true,
              HttpStatus.CREATED.value(),
              "User created successfully",
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

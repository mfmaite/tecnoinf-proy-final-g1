package com.mentora.backend.controller;

import com.mentora.backend.dto.DtUser;
import com.mentora.backend.service.UserService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @Operation(summary = "Crear un usuario",
               description = "Crea un usuario con nombre, email y password")
    @ApiResponse(responseCode = "200", description = "Usuario creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    public ResponseEntity<DtUser> createUser(@Valid @RequestBody DtUser dtUser) {
        DtUser createdUser = userService.createUser(dtUser);
        return ResponseEntity.ok(createdUser);
    }
}

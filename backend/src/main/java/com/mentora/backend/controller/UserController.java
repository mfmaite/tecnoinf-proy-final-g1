package com.mentora.backend.controller;

import com.mentora.backend.dto.DtUser;
import com.mentora.backend.service.UserService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import org.springframework.http.HttpStatus;
import com.mentora.backend.dto.ResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
    public ResponseEntity<ResponseDTO<DtUser>> createUser(@Valid @RequestBody DtUser dtUser) {
        try {
            DtUser createdUser = userService.createUser(dtUser);
            return ResponseEntity.ok(new ResponseDTO<>(
                true,
                HttpStatus.OK.value(),
                "Usuario creado exitosamente",
                createdUser
            ));
        } catch (ResponseStatusException e) {
            String message = (e.getReason() != null && !e.getReason().isBlank())
                    ? e.getReason()
                    : "Error al crear usuario";

            return ResponseEntity.status(e.getStatusCode()).body(new ResponseDTO<>(
                false,
                e.getStatusCode().value(),
                message,
                null
            ));
        } catch (Exception e) {
            String message = (e.getMessage() != null && !e.getMessage().isBlank())
                    ? e.getMessage()
                    : "Error al crear usuario";

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ResponseDTO<>(
                false,
                HttpStatus.BAD_REQUEST.value(),
                message,
                null
            ));
        }
    }
}

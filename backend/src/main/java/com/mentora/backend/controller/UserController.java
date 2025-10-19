package com.mentora.backend.controller;

import com.mentora.backend.dt.DtUser;
import com.mentora.backend.responses.DtApiResponse;
import com.mentora.backend.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear un usuario",
               description = "Crea un usuario con nombre, email y password. Solo administradores.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Usuario creado exitosamente")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    @ApiResponse(responseCode = "403", description = "No tiene permisos de administrador")
    @ApiResponse(responseCode = "409", description = "Usuario ya existe o rol inválido")
    public ResponseEntity<DtApiResponse<DtUser>> createUser(@Valid @RequestBody DtUser dtUser) {
        try {
            DtUser createdUser = userService.createUser(dtUser);

            return ResponseEntity.ok(new DtApiResponse<>(
                true,
                HttpStatus.OK.value(),
                "Usuario creado exitosamente",
                createdUser
            ));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(new DtApiResponse<>(false, e.getStatusCode().value(), e.getReason(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new DtApiResponse<>(false, HttpStatus.BAD_REQUEST.value(),
                            "Error al crear usuario", null));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar usuarios",
            description = "Devuelve todos los usuarios del sistema. Solo administradores.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Usuarios listados exitosamente")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<DtApiResponse<List<DtUser>>> listUsers(
            @RequestParam(required = false) String order,
            @RequestParam(required = false) String filter) {

        List<DtUser> users = userService.listUsers(order, filter);
        return ResponseEntity.ok(new DtApiResponse<>(true, HttpStatus.OK.value(),
                "Usuarios listados correctamente", users));
    }
}

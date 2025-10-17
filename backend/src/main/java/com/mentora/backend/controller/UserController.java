package com.mentora.backend.controller;

import com.mentora.backend.dto.ChangePasswordRequest;
import com.mentora.backend.dto.DtUser;
import com.mentora.backend.dto.ResponseDTO;
import com.mentora.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
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
    @Operation(
            summary = "Crear un usuario",
            description = "Crea un usuario con nombre, email y password. Solo administradores.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "200", description = "Usuario creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @ApiResponse(responseCode = "409", description = "Ya existe un usuario con esa CI o email, o rol no especificado")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<ResponseDTO<DtUser>> createUser(@Valid @RequestBody DtUser dtUser) {
        try {
            DtUser createdUser = userService.createUser(dtUser);
            return ResponseEntity.ok(new ResponseDTO<>(true, HttpStatus.OK.value(),
                    "Usuario creado exitosamente", createdUser));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(new ResponseDTO<>(false, e.getStatusCode().value(), e.getReason(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO<>(false, HttpStatus.BAD_REQUEST.value(),
                            "Error al crear usuario", null));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Listar usuarios",
            description = "Devuelve todos los usuarios del sistema. Solo administradores.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "200", description = "Usuarios listados exitosamente")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<ResponseDTO<List<DtUser>>> listUsers(
            @RequestParam(required = false) String order,
            @RequestParam(required = false) String filter) {

        List<DtUser> users = userService.listUsers(order, filter);
        return ResponseEntity.ok(new ResponseDTO<>(true, HttpStatus.OK.value(),
                "Usuarios listados correctamente", users));
    }

    @PostMapping("/change-password")
    @Operation(
            summary = "Cambiar contraseña",
            description = "Permite a un usuario autenticado cambiar su contraseña actual por una nueva.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "200", description = "Contraseña cambiada correctamente")
    @ApiResponse(responseCode = "400", description = "Contraseña incorrecta, nuevas contraseñas no coinciden o no cumplen requisitos")
    public ResponseEntity<ResponseDTO<Object>> changePassword(@RequestBody ChangePasswordRequest request) {
        String userCi = SecurityContextHolder.getContext().getAuthentication().getName();

        userService.changePassword(
                request.getOldPassword(),
                request.getNewPassword(),
                request.getConfirmPassword(),
                userCi
        );
        return ResponseEntity.ok(
                new ResponseDTO<>(
                        true,
                        HttpStatus.OK.value(),
                        "Contraseña cambiada correctamente",
                        null
                )
        );
    }

    @PostMapping("/password-recovery")
    @Operation(
            summary = "Recuperar contraseña",
            description = "Solicita un enlace de recuperación de contraseña para un correo registrado.",
            security = @SecurityRequirement(name = "bearerAuth") // si quieres público, puedes quitar esta línea
    )
    @ApiResponse(responseCode = "200", description = "Correo de recuperación enviado si existe el usuario")
    @ApiResponse(responseCode = "400", description = "Correo no corresponde a un usuario registrado")
    public ResponseEntity<ResponseDTO<Void>> forgotPassword(@RequestParam String email) {
        userService.forgotPassword(email);
        return ResponseEntity.ok(
                new ResponseDTO<>(
                        true,
                        HttpStatus.OK.value(),
                        "Si el usuario existe, recibirás un correo electrónico con instrucciones",
                        null
                )
        );
    }
}

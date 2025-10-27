package com.mentora.backend.controller;

import com.mentora.backend.requests.ChangePasswordRequest;
import com.mentora.backend.dt.DtUser;
import com.mentora.backend.responses.DtApiResponse;
import com.mentora.backend.service.UserService;
import com.mentora.backend.requests.ResetPasswordRequest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.context.SecurityContextHolder;

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
            @Parameter(
                    description = "Orden de listado",
                    schema = @Schema(allowableValues = {"name_asc", "name_desc", "ci_asc", "ci_desc"})
            )
            @RequestParam(required = false) String order,
            @Parameter(
                    description = "Filtro por rol",
                    schema = @Schema(allowableValues = {"todos", "administradores", "profesores", "estudiantes"})
            )
            @RequestParam(required = false) String filter) {

        try {
            List<DtUser> users = userService.getUsers(order, filter);

            return ResponseEntity.ok(new DtApiResponse<>(
                true,
                HttpStatus.OK.value(),
                "Usuarios listados correctamente",
                users
            ));

        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(new DtApiResponse<>(false, e.getStatusCode().value(), e.getReason(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new DtApiResponse<>(false, HttpStatus.BAD_REQUEST.value(),
                            "Error al listar usuarios", null));
        }
    }


    @Operation(summary = "Cambiar contraseña",
               description = "Cambia la contraseña de un usuario.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Contraseña cambiada exitosamente")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    @ApiResponse(responseCode = "400", description = "Contraseña actual incorrecta o nueva contraseña no cumple requisitos")
    @PostMapping("/change-password")
    public ResponseEntity<DtApiResponse<Object>> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            // Tomar ci directamente del token JWT ya procesado por JwtAuthenticationFilter
            String userCi = SecurityContextHolder.getContext().getAuthentication().getName();

            userService.changePassword(
                    request.getNewPassword(),
                    request.getConfirmPassword(),
                    request.getOldPassword(),
                    userCi
            );

            return ResponseEntity.ok(
                    new DtApiResponse<>(
                            true,
                            HttpStatus.OK.value(),
                            "Contraseña cambiada correctamente",
                            null
                    )
            );
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                .body(new DtApiResponse<>(
                    false,
                    e.getStatusCode().value(),
                    e.getReason(),
                    null
                )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new DtApiResponse<>(
                    false,
                    HttpStatus.BAD_REQUEST.value(),
                    "Error al cambiar contraseña",
                    null
                )
            );
        }
    }

    @Operation(summary = "Recuperar contraseña",
               description = "Recupera la contraseña de un usuario.")
    @ApiResponse(responseCode = "200", description = "Contraseña recuperada exitosamente")
    @ApiResponse(responseCode = "400", description = "Error al enviar el correo de recuperación de contraseña")
    @GetMapping("/password-recovery")
    public ResponseEntity<DtApiResponse<Void>> forgotPassword(@RequestParam String email) {
        try {
            userService.forgotPassword(email);
            return ResponseEntity.ok(new DtApiResponse<>(true, HttpStatus.OK.value(), "Si el usuario existe, recibirás un correo electrónico con instrucciones", null));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                .body(new DtApiResponse<>(false, e.getStatusCode().value(), e.getReason(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new DtApiResponse<>(false, HttpStatus.BAD_REQUEST.value(), "Error al enviar el correo de recuperación de contraseña", null));
        }
    }

    @Operation(summary = "Restablecer contraseña",
               description = "Restablece la contraseña usando un token de recuperación")
    @ApiResponse(responseCode = "200", description = "Contraseña restablecida exitosamente")
    @ApiResponse(responseCode = "400", description = "Token inválido/expirado o contraseña inválida")
    @PostMapping("/reset-password")
    public ResponseEntity<DtApiResponse<Object>> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request.getToken(), request.getNewPassword(), request.getConfirmPassword());

            return ResponseEntity.ok(new DtApiResponse<>(
                true,
                HttpStatus.OK.value(),
                "Contraseña restablecida correctamente",
                null
            ));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                .body(new DtApiResponse<>(
                    false,
                    e.getStatusCode().value(),
                    e.getReason(),
                    null
                ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new DtApiResponse<>(
                    false,
                    HttpStatus.BAD_REQUEST.value(),
                    "Error al restablecer la contraseña",
                    null
                ));
        }
    }
}

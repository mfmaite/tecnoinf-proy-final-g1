package com.mentora.backend.controller;

import com.mentora.backend.requests.ChangePasswordRequest;
import com.mentora.backend.dt.DtUser;
import com.mentora.backend.dt.DtActivity;
import com.mentora.backend.responses.BulkCreateUsersResponse;
import com.mentora.backend.responses.DtApiResponse;
import com.mentora.backend.service.UserService;
import com.mentora.backend.requests.ResetPasswordRequest;
import com.mentora.backend.requests.UpdateUserRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
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

    @Operation(
            summary = "Alta masiva de usuarios desde CSV",
            description = "Crea múltiples usuarios desde un archivo CSV. Si hay errores en alguna fila, no se crea ninguno.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "200", description = "Usuarios creados correctamente")
    @ApiResponse(responseCode = "400", description = "Error en datos del CSV")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    @PostMapping(value = "/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DtApiResponse<Object>> bulkCreateUsers(
            @RequestParam("file") MultipartFile file
    ) {
        try {
            BulkCreateUsersResponse response = userService.createUsersFromCsv(file.getInputStream());

            if (!response.getErrors().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        new DtApiResponse<>(
                                false,
                                400,
                                "El CSV contiene errores. No se crearon usuarios.",
                                response.getErrors()
                        )
                );
            }

            return ResponseEntity.ok(
                    new DtApiResponse<>(
                            true,
                            200,
                            "Usuarios creados correctamente",
                            response.getCreatedUsers()
                    )
            );

        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(
                    new DtApiResponse<>(false, e.getStatusCode().value(), e.getReason(), null)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new DtApiResponse<>(false, 400, "Error al procesar CSV", null)
            );
        }
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Editar Perfil de Usuario",
    description = "Recibe los datos del perfil editado y lo guarda en la base de datos",
    security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Usuario creado exitosamente")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DtApiResponse<DtUser>> updateUser(
            @ModelAttribute UpdateUserRequest request
    ) {
        try {
            String userCi = SecurityContextHolder.getContext().getAuthentication().getName();
            DtUser updated = userService.updateUser(userCi, request);

            return ResponseEntity.ok(
                    new DtApiResponse<>(true, 200, "Usuario actualizado", updated)
            );
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(new DtApiResponse<>(false, e.getStatusCode().value(), e.getReason(), null));
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

    @Operation(summary = "Listar actividades de un usuario",
            description = "Lista todas las actividades de un usuario",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Actividades obtenidas correctamente")
    @ApiResponse(responseCode = "403", description = "No tiene permisos necesarios")
    @GetMapping("/{userId}/activities")
    public ResponseEntity<DtApiResponse<List<DtActivity>>> getActivitiesForUser(
            @PathVariable String userId,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        try {
        List<DtActivity> activities = userService.getActivitiesForUser(userId, startDate, endDate);
        return ResponseEntity.ok().body(new DtApiResponse<>(
            true,
            HttpStatus.OK.value(),
            "Actividades obtenidas correctamente",
            activities
        ));

        } catch (ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(new DtApiResponse<>(
            false,
            e.getStatusCode().value(),
            e.getReason(),
            null
        ));
        }
    }

    @Operation(summary = "Obtener perfil de usuario, o del usuario loggeado",
               description = "Obtiene el perfil de usuario, o del usuario loggeado si no se proporciona el CI",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Perfil obtenido correctamente")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    @GetMapping("/profile")
    public ResponseEntity<DtApiResponse<DtUser>> getProfile(
            @RequestParam(name = "ci", required = false) String ci
    ) {
        try {
            String userCi = ci != null ? ci : SecurityContextHolder.getContext().getAuthentication().getName();
            DtUser profile = userService.getUser(userCi);
            return ResponseEntity.ok(new DtApiResponse<>(true, HttpStatus.OK.value(), "Perfil obtenido correctamente", profile));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new DtApiResponse<>(false, e.getStatusCode().value(), e.getReason(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new DtApiResponse<>(false, HttpStatus.BAD_REQUEST.value(), "Error al obtener el perfil", null));
        }
    }
}

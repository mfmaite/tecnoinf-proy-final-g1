package com.mentora.backend.controller;

import com.mentora.backend.dto.ResponseDTO;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test")
public class TestController {

    private final UserRepository userRepository;

    public TestController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/public")
    @Operation(summary = "Endpoint público de prueba",
               description = "No requiere autenticación. Útil para verificar que el servidor está funcionando.")
    @ApiResponse(responseCode = "200", description = "Servidor funcionando correctamente")
    public ResponseEntity<ResponseDTO<String>> publicEndpoint() {
        return ResponseEntity.ok(new ResponseDTO<>(
            true,
            HttpStatus.OK.value(),
            "Endpoint público - No requiere autenticación",
            "¡El servidor está funcionando correctamente! 🚀"
        ));
    }

    @GetMapping("/protected")
    @Operation(summary = "Endpoint protegido de prueba",
               description = "Requiere autenticación JWT. Funciona con cualquier usuario autenticado.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Usuario autenticado correctamente")
    @ApiResponse(responseCode = "401", description = "No autenticado o token inválido")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> protectedEndpoint() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        String ci = auth.getName();
        User user = userRepository.findByCi(ci).orElse(null);

        Map<String, Object> data = new HashMap<>();
        data.put("ci", ci);
        data.put("authorities", auth.getAuthorities());

        if (user != null) {
            data.put("nombre", user.getName());
            data.put("email", user.getEmail());
            data.put("rol", user.getRole());
        }

        return ResponseEntity.ok(new ResponseDTO<>(
            true,
            HttpStatus.OK.value(),
            "Autenticación verificada exitosamente ✓",
            data
        ));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Endpoint solo para administradores",
               description = "Requiere autenticación JWT y rol ADMIN",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Usuario admin autenticado")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    @ApiResponse(responseCode = "403", description = "No tiene permisos de administrador")
    public ResponseEntity<ResponseDTO<Map<String, String>>> adminEndpoint() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Map<String, String> data = new HashMap<>();
        data.put("mensaje", "Acceso concedido - Eres administrador");
        data.put("ci", auth.getName());
        data.put("rol", "ADMIN");

        return ResponseEntity.ok(new ResponseDTO<>(
            true,
            HttpStatus.OK.value(),
            "Bienvenido, Administrador 👑",
            data
        ));
    }

    @GetMapping("/profesor")
    @PreAuthorize("hasRole('PROFESOR')")
    @Operation(summary = "Endpoint solo para profesores",
               description = "Requiere autenticación JWT y rol PROFESOR",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Usuario profesor autenticado")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    @ApiResponse(responseCode = "403", description = "No tiene permisos de profesor")
    public ResponseEntity<ResponseDTO<Map<String, String>>> profesorEndpoint() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Map<String, String> data = new HashMap<>();
        data.put("mensaje", "Acceso concedido - Eres profesor");
        data.put("ci", auth.getName());
        data.put("rol", "PROFESOR");

        return ResponseEntity.ok(new ResponseDTO<>(
            true,
            HttpStatus.OK.value(),
            "Bienvenido, Profesor 👨‍🏫",
            data
        ));
    }

    @GetMapping("/estudiante")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    @Operation(summary = "Endpoint solo para estudiantes",
               description = "Requiere autenticación JWT y rol ESTUDIANTE",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Usuario estudiante autenticado")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    @ApiResponse(responseCode = "403", description = "No tiene permisos de estudiante")
    public ResponseEntity<ResponseDTO<Map<String, String>>> estudianteEndpoint() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Map<String, String> data = new HashMap<>();
        data.put("mensaje", "Acceso concedido - Eres estudiante");
        data.put("ci", auth.getName());
        data.put("rol", "ESTUDIANTE");

        return ResponseEntity.ok(new ResponseDTO<>(
            true,
            HttpStatus.OK.value(),
            "Bienvenido, Estudiante 📚",
            data
        ));
    }

    @GetMapping("/admin-or-profesor")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESOR')")
    @Operation(summary = "Endpoint para admin o profesor",
               description = "Requiere autenticación JWT y rol ADMIN o PROFESOR",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Usuario con permisos correctos")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    @ApiResponse(responseCode = "403", description = "No tiene los permisos requeridos")
    public ResponseEntity<ResponseDTO<Map<String, String>>> adminOrProfesorEndpoint() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Map<String, String> data = new HashMap<>();
        data.put("mensaje", "Acceso concedido - Eres admin o profesor");
        data.put("ci", auth.getName());
        data.put("authorities", auth.getAuthorities().toString());

        return ResponseEntity.ok(new ResponseDTO<>(
            true,
            HttpStatus.OK.value(),
            "Acceso concedido ✓",
            data
        ));
    }
}


package com.mentora.backend.controller;

import com.mentora.backend.dt.DtLogin;
import com.mentora.backend.responses.DtApiResponse;
import com.mentora.backend.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import com.mentora.backend.responses.LoginResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión",
               description = "Autentica un usuario y devuelve un token JWT y datos del usuario")
    @ApiResponse(responseCode = "200", description = "Autenticación exitosa")
    @ApiResponse(responseCode = "401", description = "Credenciales inválidas")
    public ResponseEntity<DtApiResponse<LoginResponse>> login(@RequestBody DtLogin dtLogin) {
        try {
            LoginResponse loginResponse = authService.login(dtLogin);

            return ResponseEntity.ok().body(new DtApiResponse<LoginResponse>(
                true,
                HttpStatus.OK.value(),
                "Autenticación exitosa",
                loginResponse
            ));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new DtApiResponse<>(
                false,
                HttpStatus.UNAUTHORIZED.value(),
                "Credenciales incorrectas",
                null
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new DtApiResponse<>(
                false,
                HttpStatus.UNAUTHORIZED.value(),
                "Credenciales incorrectas",
                null
            ));
        }
    }
}

package com.mentora.backend.controller;

import com.mentora.backend.dto.DtLogin;
import com.mentora.backend.dto.DtLoginResponse;
import com.mentora.backend.dto.ResponseDTO;
import com.mentora.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
    public ResponseEntity<ResponseDTO<DtLoginResponse>> login(@RequestBody DtLogin dtLogin) {
        try {
            DtLoginResponse dtLoginResponse = authService.login(dtLogin);

            return ResponseEntity.ok().body(new ResponseDTO<>(
                true,
                HttpStatus.OK.value(),
                "Autenticación exitosa",
                dtLoginResponse
            ));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ResponseDTO<>(
                false,
                HttpStatus.UNAUTHORIZED.value(),
                "Credenciales incorrectas",
                null
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ResponseDTO<>(
                false,
                HttpStatus.UNAUTHORIZED.value(),
                "Credenciales incorrectas",
                null
            ));
        }
    }
}

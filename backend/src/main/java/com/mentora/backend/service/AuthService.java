package com.mentora.backend.service;

import com.mentora.backend.dto.DtLogin;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.UserRepository;
import com.mentora.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public String login(DtLogin dtLogin) {
        if (dtLogin.getCi() == null || dtLogin.getCi().isBlank() ||
                dtLogin.getPassword() == null || dtLogin.getPassword().isBlank()) {
            throw new IllegalArgumentException("CI y contraseña son requeridos");
        }

        User user = userRepository.findByCi(dtLogin.getCi())
                .orElseThrow(() -> new RuntimeException("Usuario no existe"));

        if (!passwordEncoder.matches(dtLogin.getPassword(), user.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return jwtService.generateToken(user);
    }
}

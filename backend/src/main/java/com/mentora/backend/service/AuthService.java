package com.mentora.backend.service;

import com.mentora.backend.dto.DtLogin;
import com.mentora.backend.dto.DtUser;
import com.mentora.backend.dto.DtLoginResponse;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.UserRepository;
import com.mentora.backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    public DtLoginResponse login(DtLogin dtLogin) {
        if (dtLogin.getCi() == null || dtLogin.getCi().isBlank() ||
                dtLogin.getPassword() == null || dtLogin.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas");
        }

        User user = userRepository.findByCi(dtLogin.getCi())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas"));

        if (!passwordEncoder.matches(dtLogin.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas");
        }

        String jwt = jwtService.generateToken(user);

        DtUser dtUser = new DtUser(
                user.getCi(),
                user.getName(),
                user.getEmail(),
                user.getDescription(),
                user.getPictureUrl(),
                user.getRole()
        );

        return new DtLoginResponse(jwt, dtUser);
    }
}

package com.mentora.backend.service;

import com.mentora.backend.dt.DtLogin;
import com.mentora.backend.dt.DtUser;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.UserRepository;
import com.mentora.backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.mentora.backend.responses.LoginResponse;
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    public AuthService(UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder, UserService userService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
    }

    public LoginResponse login(DtLogin dtLogin) {
        if (dtLogin.getCi() == null || dtLogin.getCi().isBlank() ||
                dtLogin.getPassword() == null || dtLogin.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas");
        }

        User user = userRepository.findByCi(dtLogin.getCi())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas"));

        if (!passwordEncoder.matches(dtLogin.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas");
        }

        DtUser userDto = userService.getUserDto(user);
        return new LoginResponse(userDto, jwtService.generateToken(user));
    }
}

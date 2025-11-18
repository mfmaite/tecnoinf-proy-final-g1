package com.mentora.backend.servicetest;

import com.mentora.backend.dt.DtLogin;
import com.mentora.backend.dt.DtUser;
import com.mentora.backend.model.Role;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.UserRepository;
import com.mentora.backend.responses.LoginResponse;
import com.mentora.backend.security.JwtService;
import com.mentora.backend.service.AuthService;
import com.mentora.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthService authService;

    @Test
    void login_exitoso() {
        DtLogin login = new DtLogin("11111111", "Admin123");

        User user = new User();
        user.setCi("11111111");
        user.setPassword("passwordEncriptado");

        DtUser userDto = new DtUser(
                "11111111",
                "nombre",
                "nombre@gmail.com",
                null,
                null,
                Role.ADMIN
        );


        when(userRepository.findByCi("11111111")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Admin123", "passwordEncriptado")).thenReturn(true);
        when(userService.getUserDto(user)).thenReturn(userDto);
        when(jwtService.generateToken(user)).thenReturn("TOKEN123");

        LoginResponse response = authService.login(login);

        assertNotNull(response);
        assertEquals("TOKEN123", response.getToken());
        assertEquals("11111111", response.getUser().getCi());

        verify(userRepository, times(1)).findByCi("11111111");
        verify(passwordEncoder, times(1)).matches("Admin123", "passwordEncriptado");
        verify(jwtService, times(1)).generateToken(user);
    }

    @Test
    void login_ciOVacia_lanzaError() {
        DtLogin login = new DtLogin("", "password");
        assertThrows(ResponseStatusException.class, () -> authService.login(login));
    }

    @Test
    void login_passVacia_lanzaError() {
        DtLogin login = new DtLogin("11111111", "");
        assertThrows(ResponseStatusException.class, () -> authService.login(login));
    }

    @Test
    void login_usuarioNoExiste() {
        DtLogin login = new DtLogin("11111112", "Admin123");

        when(userRepository.findByCi("11111112")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> authService.login(login));
    }

    @Test
    void login_passwordIncorrecta() {
        DtLogin login = new DtLogin("11111111", "Admin12345");

        User user = new User();
        user.setCi("11111111");
        user.setPassword("enc");

        when(userRepository.findByCi("11111111")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Admin12345", "enc")).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> authService.login(login));
    }
}

package com.mentora.backend.service;

import com.mentora.backend.dto.DtUser;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Buscar por CI
    public User findByCI(String ci) {
        return userRepository.findByCi(ci).orElse(null);
    }

    // Buscar por email
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    // Crear usuario con verificación de CI y email
    public DtUser createUser(DtUser dto) {
        if (findByCI(dto.getCi()) != null) {
            throw new RuntimeException("Ya existe un usuario con esa CI");
        }

        if (findByEmail(dto.getEmail()) != null) {
            throw new RuntimeException("Ya existe un usuario con ese email");
        }

        User user = new User();
        user.setCi(dto.getCi());
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setDescription(dto.getDescription());
        user.setPictureUrl(dto.getPictureUrl());
        user.setRole(dto.getRole());

        User saved = userRepository.save(user);

        // Devolver DTO sin contraseña
        return new DtUser(
                saved.getCi(),
                saved.getName(),
                saved.getEmail(),
                null, // no devolver contraseña
                saved.getDescription(),
                saved.getPictureUrl(),
                saved.getRole()
        );
    }
}

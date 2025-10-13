package com.mentora.backend.service;

import com.mentora.backend.dto.DtUser;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User findByCI(String ci) {
        return userRepository.findByCi(ci).orElse(null);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public DtUser createUser(DtUser dto) {
        if (dto.getRole() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El rol es requerido");
        }

        if (findByCI(dto.getCi()) != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con esa CI");
        }

        if (findByEmail(dto.getEmail()) != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese email");
        }

        User user = new User(
            dto.getCi(),
            dto.getName(),
            dto.getEmail(),
            passwordEncoder.encode(dto.getPassword()),
            dto.getDescription(),
            dto.getPictureUrl(),
            dto.getRole()
        );

        userRepository.save(user);

        return new DtUser(
            user.getCi(),
            user.getName(),
            user.getEmail(),
            user.getDescription(),
            user.getPictureUrl(),
            user.getRole()
        );
    }
}

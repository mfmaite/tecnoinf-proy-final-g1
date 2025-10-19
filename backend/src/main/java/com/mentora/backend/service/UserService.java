package com.mentora.backend.service;

import com.mentora.backend.dt.DtUser;
import com.mentora.backend.model.Role;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public User findByCI(String ci) {
        return userRepository.findByCi(ci).orElse(null);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public DtUser createUser(DtUser dto) {
        if (dto.getRole() == null)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El rol es requerido");

        if (findByCI(dto.getCi()) != null)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con esa CI");

        if (findByEmail(dto.getEmail()) != null)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese email");

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

        try {
            emailService.sendEmail(
                    user.getEmail(),
                    "Bienvenido a Mentora",
                    "Le damos la bienvenida a Mentora. Su usuario es: " + user.getCi()
            );
        } catch (Exception ignored) {}

        return getUserDto(user);
    }

    public List<DtUser> listUsers(String order, String filter) {
        List<User> users = userRepository.findAll();

        String f = (filter == null ? "todos" : filter.toLowerCase());
        switch (f) {
            case "administradores":
                users = users.stream().filter(u -> u.getRole() == Role.ADMIN).collect(Collectors.toList());
                break;
            case "profesores":
                users = users.stream().filter(u -> u.getRole() == Role.PROFESOR).collect(Collectors.toList());
                break;
            case "estudiantes":
                users = users.stream().filter(u -> u.getRole() == Role.ESTUDIANTE).collect(Collectors.toList());
                break;
            default:
                break;
        }

        String o = (order == null ? "name_asc" : order.toLowerCase());
        Comparator<User> comparator;
        switch (o) {
            case "name_desc":
                comparator = Comparator.comparing((User u) -> u.getName().toLowerCase()).reversed();
                break;
            case "ci_asc":
                comparator = Comparator.comparing(User::getCi);
                break;
            case "ci_desc":
                comparator = Comparator.comparing(User::getCi).reversed();
                break;
            default:
                comparator = Comparator.comparing((User u) -> u.getName().toLowerCase());
        }
        users = users.stream().sorted(comparator).collect(Collectors.toList());

        return users.stream().map(this::getUserDto).collect(Collectors.toList());
    }

    public DtUser getUserDto(User u) {
        return new DtUser(u.getCi(), u.getName(), u.getEmail(), u.getDescription(), u.getPictureUrl(), u.getRole());
    }
}

package com.mentora.backend.service;

import com.mentora.backend.dt.DtFileResource;
import com.mentora.backend.dt.DtUser;
import com.mentora.backend.model.Role;
import com.mentora.backend.model.User;
import com.mentora.backend.model.PasswordResetToken;
import com.mentora.backend.repository.PasswordResetTokenRepository;
import com.mentora.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final FileStorageService fileStorageService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService, PasswordResetTokenRepository passwordResetTokenRepository, FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.fileStorageService = fileStorageService;
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

        if (!isValidPassword(dto.getPassword()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña no cumple los requisitos");

        User user = new User(
                dto.getCi(),
                dto.getName(),
                dto.getEmail(),
                passwordEncoder.encode(dto.getPassword()),
                dto.getDescription(),
                null,
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

    public List<DtUser> getUsers(String order, String filter) {
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
        Comparator<User> comparator = switch (o) {
            case "name_desc" -> Comparator.comparing((User u) -> u.getName().toLowerCase()).reversed();
            case "ci_asc" -> Comparator.comparing(User::getCi);
            case "ci_desc" -> Comparator.comparing(User::getCi).reversed();
            default -> Comparator.comparing((User u) -> u.getName().toLowerCase());
        };
        users = users.stream().sorted(comparator).collect(Collectors.toList());

        return users.stream().map(this::getUserDto).collect(Collectors.toList());
    }

    public DtUser updateUser(String ci, DtUser dto, MultipartFile picture) {
        User u = userRepository.findByCi(ci)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (dto.getName() == null || dto.getName().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre requerido");

        if (dto.getEmail() == null || !dto.getEmail().contains("@"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email inválido");

        u.setName(dto.getName());
        u.setEmail(dto.getEmail());
        u.setDescription(dto.getDescription());

        if (picture != null && !picture.isEmpty()) {
            try {
                DtFileResource fr = fileStorageService.store(picture);
                u.setPictureFileName(fr.getStoragePath());
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error subiendo la imagen");
            }
        }

        userRepository.save(u);
        return getUserDto(u);
    }


    public DtUser getUserDto(User u) {
        return new DtUser(u.getCi(), u.getName(), u.getEmail(), u.getDescription(), u.getPictureFileName(), u.getRole());
    }

    public void changePassword(String newPwd, String confirmPwd, String oldPwd, String userCi) {
        User user = Optional.ofNullable(findByCI(userCi))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario no encontrado"));

        if (!newPwd.equals(confirmPwd))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nueva contraseña y la confirmación no coinciden");

        if (!passwordEncoder.matches(oldPwd, user.getPassword()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña actual no es correcta");

        if (!isValidPassword(newPwd))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nueva contraseña no cumple los requisitos");

        user.setPassword(passwordEncoder.encode(newPwd));
        userRepository.save(user);
    }

    private boolean isValidPassword(String password) {
        return password != null &&
                password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$");
    }

    public void forgotPassword(String email) {
        Optional<User> maybeUser = userRepository.findByEmail(email);

        if (maybeUser.isEmpty()) {
            return;
        }
        User user = maybeUser.get();

        String token = UUID.randomUUID().toString();
        Instant expiry = Instant.now().plus(Duration.ofHours(2));

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(expiry);
        passwordResetTokenRepository.save(resetToken);

        String link = "https://tu-frontend.com/reset-password?token=" + token;

        String subject = "Recuperación de contraseña";
        String body = "Haz clic en el siguiente enlace para restablecer tu contraseña (válido por 2 horas): " + link;

        emailService.sendEmail(user.getEmail(), subject, body);
    }

    public void resetPassword(String token, String newPassword, String confirmPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido"));

        if (resetToken.getExpiryDate().isBefore(Instant.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token expirado");
        }

        if (!Objects.equals(newPassword, confirmPassword)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nueva contraseña y la confirmación no coinciden");
        }

        if (!isValidPassword(newPassword)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nueva contraseña no cumple los requisitos");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Invalidate token after use
        passwordResetTokenRepository.delete(resetToken);
    }
}

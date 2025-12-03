package com.mentora.backend.service;

import com.mentora.backend.dt.DtFileResource;
import com.mentora.backend.dt.DtActivity;
import com.mentora.backend.dt.DtUser;
import com.mentora.backend.model.Role;
import com.mentora.backend.model.Activity;
import com.mentora.backend.model.User;
import com.mentora.backend.model.PasswordResetToken;
import com.mentora.backend.repository.PasswordResetTokenRepository;
import com.mentora.backend.repository.UserRepository;
import com.mentora.backend.repository.ActivityRepository;
import com.mentora.backend.responses.BulkCreateUsersResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.mentora.backend.requests.UpdateUserRequest;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.exceptions.CsvException;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final ActivityRepository activityRepository;
    private final FileStorageService fileStorageService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService, PasswordResetTokenRepository passwordResetTokenRepository, ActivityRepository activityRepository, FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.activityRepository = activityRepository;
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

    public BulkCreateUsersResponse createUsersFromCsv(InputStream csvInputStream) throws IOException, CsvException {
        if (csvInputStream == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo CSV requerido");
        }

        List<DtUser> created = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        try (CSVReader reader = new CSVReaderBuilder(new InputStreamReader(csvInputStream, StandardCharsets.UTF_8)).build()) {
            List<String[]> rows = reader.readAll();

            if (rows == null || rows.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo CSV vacío");
            }

            int line = 0;
            for (String[] row : rows) {
                line++;

                if (row == null) { continue; }
                if (line == 1 && row.length > 0 && row[0] != null && row[0].trim().equalsIgnoreCase("ci")) {
                    continue;
                }

                String ci       = row[0] != null ? row[0].trim() : "";
                String nombre   = row[1] != null ? row[1].trim() : "";
                String apellido = row[2] != null ? row[2].trim() : "";
                String email    = row[3] != null ? row[3].trim() : "";
                String pass     = row[4] != null ? row[4].trim() : "";
                String rol      = row[5] != null ? row[5].trim() : "";

                if (!ci.matches("^\\d+$")) {
                    errors.add("Fila " + line + ": CI inválido");
                    continue;
                }
                if (nombre.isEmpty() || apellido.isEmpty()) {
                    errors.add("Fila " + line + ": Nombre y apellido obligatorios");
                    continue;
                }
                if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
                    errors.add("Fila " + line + ": Email inválido");
                    continue;
                }
                if (!pass.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")) {
                    errors.add("Fila " + line + ": Contraseña inválida");
                    continue;
                }
                if (!rol.equals("Estudiante") && !rol.equals("Profesor") && !rol.equals("Administrador")) {
                    errors.add("Fila " + line + ": Rol inválido");
                    continue;
                }

                if (userRepository.existsByCi(ci)) {
                    errors.add("Fila " + line + ": CI duplicado");
                    continue;
                }
                if (userRepository.existsByEmail(email)) {
                    errors.add("Fila " + line + ": Email duplicado");
                    continue;
                }

                User user = new User(ci, nombre + " " + apellido, email, pass, null, null, null, mapRole(rol));
                userRepository.save(user);
                created.add(getUserDto(user));
            }
        } catch (CsvException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV inválido");
        }

        return new BulkCreateUsersResponse(created, errors);
    }

    private Role mapRole(String rol) {
        return switch (rol.toLowerCase()) {
            case "estudiante" -> Role.ESTUDIANTE;
            case "profesor" -> Role.PROFESOR;
            case "administrador" -> Role.ADMIN;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol inválido");
        };
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

    public DtUser updateUser(String ci, UpdateUserRequest request) {
        User u = findByCI(ci);

        if (u == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado");

        if (request.getName() != null)
            u.setName(request.getName());
        if (request.getEmail() != null)
            u.setEmail(request.getEmail());
        if (request.getDescription() != null)
            u.setDescription(request.getDescription());

        if (request.getPicture() != null && !request.getPicture().isEmpty()) {
            try {
                DtFileResource fr = fileStorageService.store(request.getPicture());
                String fileName = fr.getFilename();
                String fileUrl = fr.getStoragePath();
                u.setPictureFileName(fileName);
                u.setPictureUrl(fileUrl);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error subiendo la imagen");
            }
        }

        userRepository.save(u);
        return getUserDto(u);
    }


    public DtUser getUserDto(User u) {
        String signedPictureUrl = null;

        if (u.getPictureUrl() != null && u.getPictureUrl().startsWith("gs://")) {
            signedPictureUrl = fileStorageService.generateSignedUrl(u.getPictureUrl());
        }

        return new DtUser(
            u.getCi(),
            u.getName(),
            u.getEmail(),
            u.getDescription(),
            signedPictureUrl,
            u.getRole()
        );
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

        String link = "https://tecnoinf-proy-final-g1-production.up.railway.app/reset-password?token=" + token;

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

    public List<DtActivity> getActivitiesForUser(String userId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime;
        LocalDateTime endDateTime;

        LocalDateTime startOfTimes = LocalDateTime.of(1000, 1, 1, 0, 0);
        LocalDate today = LocalDate.now();
        LocalDateTime startOfMonth = LocalDateTime.of(today.withDayOfMonth(1), LocalTime.MIN);
        LocalDateTime endOfMonth = LocalDateTime.of(today.withDayOfMonth(today.getMonth().length(today.isLeapYear())), LocalTime.MAX);



        if (startDate == null && endDate == null) {
            // Si ambos son null se trae solo lo del mes actual
            startDateTime = startOfMonth;
            endDateTime = endOfMonth;
        } else {
            startDateTime = (startDate != null)
                    ? startDate.atStartOfDay()
                    : startOfTimes;

            endDateTime = (endDate != null)
                    ? endDate.atTime(LocalTime.MAX)
                    : endOfMonth;
        }

        return activityRepository
                .findByUser_CiAndCreatedDateBetween(userId, startDateTime, endDateTime)
                .stream()
                .map(this::getDtActivity)
                .toList();
    }

    public DtUser getUser(String ci) {
        User u = findByCI(ci);
        if (u == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado");
        return getUserDto(u);
    }

    private DtActivity getDtActivity(Activity activity) {
        return new DtActivity(
            activity.getId(),
            activity.getType(),
            activity.getDescription(),
            activity.getLink(),
            activity.getCreatedDate()
        );
    }
}

package com.mentora.backend.controller;

import com.mentora.backend.requests.ChangePasswordRequest;
import com.mentora.backend.requests.CreateUserRequest;
import com.mentora.backend.dt.DtUser;
import com.mentora.backend.dt.DtActivity;
import com.mentora.backend.responses.BulkCreateUsersResponse;
import com.mentora.backend.responses.DtApiResponse;
import com.mentora.backend.service.UserService;
import com.opencsv.exceptions.CsvException;
import com.mentora.backend.requests.ResetPasswordRequest;
import com.mentora.backend.requests.UpdateUserRequest;
import com.mentora.backend.responses.GetPendingItemsResponse;
import com.mentora.backend.dt.DtEvaluation;
import com.mentora.backend.dt.DtQuiz;
import com.mentora.backend.model.User;
import com.mentora.backend.model.UserCourse;
import com.mentora.backend.model.Evaluation;
import com.mentora.backend.model.Quiz;
import com.mentora.backend.repository.UserRepository;
import com.mentora.backend.repository.UserCourseRepository;
import com.mentora.backend.repository.EvaluationRepository;
import com.mentora.backend.repository.EvaluationSubmissionRepository;
import com.mentora.backend.repository.QuizRepository;
import com.mentora.backend.repository.QuizSubmissionRepository;
import com.mentora.backend.service.EvaluationService;
import com.mentora.backend.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.format.annotation.DateTimeFormat;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/users")
@Tag(name = "Usuarios", description = "Gestiona los usuarios")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final UserCourseRepository userCourseRepository;
    private final EvaluationRepository evaluationRepository;
    private final EvaluationSubmissionRepository evaluationSubmissionRepository;
    private final QuizRepository quizRepository;
    private final QuizSubmissionRepository quizSubmissionRepository;
    private final EvaluationService evaluationService;
    private final QuizService quizService;

    public UserController(
            UserService userService,
            UserRepository userRepository,
            UserCourseRepository userCourseRepository,
            EvaluationRepository evaluationRepository,
            EvaluationSubmissionRepository evaluationSubmissionRepository,
            QuizRepository quizRepository,
            QuizSubmissionRepository quizSubmissionRepository,
            EvaluationService evaluationService,
            QuizService quizService
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.userCourseRepository = userCourseRepository;
        this.evaluationRepository = evaluationRepository;
        this.evaluationSubmissionRepository = evaluationSubmissionRepository;
        this.quizRepository = quizRepository;
        this.quizSubmissionRepository = quizSubmissionRepository;
        this.evaluationService = evaluationService;
        this.quizService = quizService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear un usuario",
               description = "Crea un usuario con nombre, email y password. Solo administradores.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Usuario creado exitosamente")
    @ApiResponse(responseCode = "400", description = "La contraseña no cumple los requisitos")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    @ApiResponse(responseCode = "403", description = "No tiene permisos de administrador")
    @ApiResponse(responseCode = "409", description = "Usuario ya existe o rol inválido")
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DtApiResponse<DtUser>> createUser(@Valid @ModelAttribute CreateUserRequest createUserRequest) {
        try {
            DtUser createdUser = userService.createUser(createUserRequest);

            return ResponseEntity.ok(new DtApiResponse<>(
                true,
                HttpStatus.OK.value(),
                "Usuario creado exitosamente",
                createdUser
            ));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(new DtApiResponse<>(false, e.getStatusCode().value(), e.getReason(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new DtApiResponse<>(false, HttpStatus.BAD_REQUEST.value(),
                            "Error al crear usuario", null));
        }
    }

    @Operation(
        summary = "Alta masiva de usuarios desde CSV",
        description = "Crea múltiples usuarios desde un archivo CSV. Si hay errores en alguna fila, no se crea ninguno.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "200", description = "Usuarios creados correctamente")
    @ApiResponse(responseCode = "207", description = "Algunos usuarios no pudieron crearse")
    @ApiResponse(responseCode = "400", description = "CSV invalido")
    @ApiResponse(responseCode = "403", description = "No tiene permisos necesarios")
    @PostMapping(value = "/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DtApiResponse<BulkCreateUsersResponse>> bulkCreateUsers(
        @RequestParam("file") MultipartFile file
    ) {
        try {
            BulkCreateUsersResponse response = userService.createUsersFromCsv(file.getInputStream());

            if (response.getErrors().isEmpty() ||  response.getErrors() == null) {
                return ResponseEntity.ok(new DtApiResponse<>(
                    true,
                    200,
                    "Usuarios creados correctamente",
                    response
                ));
            }

            if (response.getCreatedUsers() != null && !response.getCreatedUsers().isEmpty()) {
                return ResponseEntity.status(207).body(new DtApiResponse<>(
                        false,
                        207,
                        "Algunos usuarios no pudieron crearse",
                        response
                ));
            }

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new DtApiResponse<>(
                    false,
                    400,
                    "Ningún curso se creó. Revise los errores",
                    response
            ));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new DtApiResponse<>(
                    false,
                    400,
                    "Error leyendo CSV",
                    null
            ));
        } catch (CsvException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new DtApiResponse<>(
                    false,
                    400,
                    "CSV inválido",
                    null
            ));
        }
    }

    @Operation(
            summary = "Listar evaluaciones y quizzes pendientes del usuario loggeado",
            description = "Retorna evaluaciones y quizzes del usuario sin entrega, ordenados por curso. Incluye items sin fecha o con fecha futura.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "200", description = "Pendientes obtenidos correctamente")
    @ApiResponse(responseCode = "403", description = "No tiene permisos necesarios")
    @GetMapping("/pending")
    public ResponseEntity<DtApiResponse<GetPendingItemsResponse>> getPendingForUser() {
        try {
            String userCi = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findById(userCi)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

            List<UserCourse> enrollments = userCourseRepository.findAllByUser(user);
            LocalDateTime now = LocalDateTime.now();

            List<DtEvaluation> pendingEvaluations = new ArrayList<>();
            List<DtQuiz> pendingQuizzes = new ArrayList<>();

            for (UserCourse uc : enrollments) {
                String courseId = uc.getCourse().getId();

                // Evaluaciones pendientes
                List<Evaluation> evaluations = evaluationRepository.findByCourse_IdOrderByCreatedDateAsc(courseId);
                for (Evaluation ev : evaluations) {
                    boolean notExpired = ev.getDueDate() == null || ev.getDueDate().isAfter(now);
                    if (!notExpired) continue;
                    boolean hasSubmission = !evaluationSubmissionRepository.findByEvaluationIdAndAuthorCi(ev.getId(), userCi).isEmpty();
                    if (!hasSubmission) {
                        pendingEvaluations.add(evaluationService.getDtEvaluation(ev));
                    }
                }

                // Quizzes pendientes
                List<Quiz> quizzes = quizRepository.findByCourse_IdOrderByCreatedDateAsc(courseId);
                for (Quiz q : quizzes) {
                    boolean notExpired = q.getDueDate() == null || q.getDueDate().isAfter(now);
                    if (!notExpired) continue;
                    boolean hasSubmission = !quizSubmissionRepository.findByQuizIdAndAuthorCi(q.getId(), userCi).isEmpty();
                    if (!hasSubmission) {
                        pendingQuizzes.add(quizService.getDtQuiz(q));
                    }
                }
            }

            GetPendingItemsResponse payload = new GetPendingItemsResponse(pendingEvaluations, pendingQuizzes);
            return ResponseEntity.ok(new DtApiResponse<>(
                    true,
                    HttpStatus.OK.value(),
                    "Pendientes obtenidos correctamente",
                    payload
            ));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new DtApiResponse<>(
                    false,
                    e.getStatusCode().value(),
                    e.getReason(),
                    null
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new DtApiResponse<>(
                    false,
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    e.getMessage(),
                    null
            ));
        }
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Editar Perfil de Usuario",
    description = "Recibe los datos del perfil editado y lo guarda en la base de datos",
    security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Usuario creado exitosamente")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DtApiResponse<DtUser>> updateUser(
            @ModelAttribute UpdateUserRequest request
    ) {
        try {
            String userCi = SecurityContextHolder.getContext().getAuthentication().getName();
            DtUser updated = userService.updateUser(userCi, request);

            return ResponseEntity.ok(
                    new DtApiResponse<>(true, 200, "Usuario actualizado", updated)
            );
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(new DtApiResponse<>(false, e.getStatusCode().value(), e.getReason(), null));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar usuarios",
            description = "Devuelve todos los usuarios del sistema. Solo administradores.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Usuarios listados exitosamente")
    @ApiResponse(responseCode = "403", description = "Acceso denegado")
    public ResponseEntity<DtApiResponse<List<DtUser>>> listUsers(
            @Parameter(
                    description = "Orden de listado",
                    schema = @Schema(allowableValues = {"name_asc", "name_desc", "ci_asc", "ci_desc"})
            )
            @RequestParam(required = false) String order,
            @Parameter(
                    description = "Filtro por rol",
                    schema = @Schema(allowableValues = {"todos", "administradores", "profesores", "estudiantes"})
            )
            @RequestParam(required = false) String filter) {

        try {
            List<DtUser> users = userService.getUsers(order, filter);

            return ResponseEntity.ok(new DtApiResponse<>(
                true,
                HttpStatus.OK.value(),
                "Usuarios listados correctamente",
                users
            ));

        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(new DtApiResponse<>(false, e.getStatusCode().value(), e.getReason(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new DtApiResponse<>(false, HttpStatus.BAD_REQUEST.value(),
                            "Error al listar usuarios", null));
        }
    }


    @Operation(summary = "Cambiar contraseña",
               description = "Cambia la contraseña de un usuario.",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Contraseña cambiada exitosamente")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    @ApiResponse(responseCode = "400", description = "Contraseña actual incorrecta o nueva contraseña no cumple requisitos")
    @PostMapping("/change-password")
    public ResponseEntity<DtApiResponse<Object>> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            // Tomar ci directamente del token JWT ya procesado por JwtAuthenticationFilter
            String userCi = SecurityContextHolder.getContext().getAuthentication().getName();

            userService.changePassword(
                    request.getNewPassword(),
                    request.getConfirmPassword(),
                    request.getOldPassword(),
                    userCi
            );

            return ResponseEntity.ok(
                    new DtApiResponse<>(
                            true,
                            HttpStatus.OK.value(),
                            "Contraseña cambiada correctamente",
                            null
                    )
            );
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                .body(new DtApiResponse<>(
                    false,
                    e.getStatusCode().value(),
                    e.getReason(),
                    null
                )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new DtApiResponse<>(
                    false,
                    HttpStatus.BAD_REQUEST.value(),
                    "Error al cambiar contraseña",
                    null
                )
            );
        }
    }

    @Operation(summary = "Recuperar contraseña",
               description = "Recupera la contraseña de un usuario.")
    @ApiResponse(responseCode = "200", description = "Contraseña recuperada exitosamente")
    @ApiResponse(responseCode = "400", description = "Error al enviar el correo de recuperación de contraseña")
    @GetMapping("/password-recovery")
    public ResponseEntity<DtApiResponse<Void>> forgotPassword(@RequestParam String email) {
        try {
            userService.forgotPassword(email);
            return ResponseEntity.ok(new DtApiResponse<>(true, HttpStatus.OK.value(), "Si el usuario existe, recibirás un correo electrónico con instrucciones", null));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                .body(new DtApiResponse<>(false, e.getStatusCode().value(), e.getReason(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new DtApiResponse<>(false, HttpStatus.BAD_REQUEST.value(), "Error al enviar el correo de recuperación de contraseña", null));
        }
    }

    @Operation(summary = "Restablecer contraseña",
               description = "Restablece la contraseña usando un token de recuperación")
    @ApiResponse(responseCode = "200", description = "Contraseña restablecida exitosamente")
    @ApiResponse(responseCode = "400", description = "Token inválido/expirado o contraseña inválida")
    @PostMapping("/reset-password")
    public ResponseEntity<DtApiResponse<Object>> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request.getToken(), request.getNewPassword(), request.getConfirmPassword());

            return ResponseEntity.ok(new DtApiResponse<>(
                true,
                HttpStatus.OK.value(),
                "Contraseña restablecida correctamente",
                null
            ));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                .body(new DtApiResponse<>(
                    false,
                    e.getStatusCode().value(),
                    e.getReason(),
                    null
                ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new DtApiResponse<>(
                    false,
                    HttpStatus.BAD_REQUEST.value(),
                    "Error al restablecer la contraseña",
                    null
                ));
        }
    }

    @Operation(summary = "Listar actividades del usuario loggeado",
            description = "Lista todas las actividades del usuario loggeado",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Actividades obtenidas correctamente")
    @ApiResponse(responseCode = "403", description = "No tiene permisos necesarios")
    @GetMapping("/activities")
    public ResponseEntity<DtApiResponse<List<DtActivity>>> getActivitiesForUser(
            @RequestParam(name = "ci", required = false) String ci,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        try {
            String userId = SecurityContextHolder.getContext().getAuthentication().getName();
            List<DtActivity> activities = userService.getActivitiesForUser(userId, startDate, endDate);
            return ResponseEntity.ok().body(new DtApiResponse<>(
                true,
                HttpStatus.OK.value(),
                "Actividades obtenidas correctamente",
                activities
            ));

        } catch (ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(new DtApiResponse<>(
            false,
            e.getStatusCode().value(),
            e.getReason(),
            null
        ));
        }
    }

    @Operation(summary = "Obtener perfil de usuario, o del usuario loggeado",
               description = "Obtiene el perfil de usuario, o del usuario loggeado si no se proporciona el CI",
               security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Perfil obtenido correctamente")
    @ApiResponse(responseCode = "401", description = "No autenticado")
    @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    @GetMapping("/profile")
    public ResponseEntity<DtApiResponse<DtUser>> getProfile(
            @RequestParam(name = "ci", required = false) String ci
    ) {
        try {
            String userCi = ci != null ? ci : SecurityContextHolder.getContext().getAuthentication().getName();
            DtUser profile = userService.getUser(userCi);
            return ResponseEntity.ok(new DtApiResponse<>(true, HttpStatus.OK.value(), "Perfil obtenido correctamente", profile));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new DtApiResponse<>(false, e.getStatusCode().value(), e.getReason(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new DtApiResponse<>(false, HttpStatus.BAD_REQUEST.value(), "Error al obtener el perfil", null));
        }
    }
}

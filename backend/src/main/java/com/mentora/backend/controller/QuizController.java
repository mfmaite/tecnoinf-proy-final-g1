package com.mentora.backend.controller;

import com.mentora.backend.dt.DtQuiz;
import com.mentora.backend.dt.DtQuizSubmission;
import com.mentora.backend.requests.CreateQuizSubmissionRequest;
import com.mentora.backend.requests.UpdateQuizRequest;
import com.mentora.backend.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.mentora.backend.responses.DtApiResponse;

@RestController
@RequestMapping("/quizzes")
public class QuizController {

  private final QuizService quizService;

  public QuizController(QuizService quizService) {
    this.quizService = quizService;
  }

  @Operation(
    summary = "Editar quiz",
    description = "Edita un quiz existente. Solo profesores",
    security = @SecurityRequirement(name = "bearerAuth")
  )
  @ApiResponse(responseCode = "200", description = "Quiz editado")
  @ApiResponse(responseCode = "400", description = "Datos inválidos")
  @ApiResponse(responseCode = "403", description = "No tiene permisos")
  @ApiResponse(responseCode = "404", description = "Quiz no encontrado")
  @PutMapping("/{quizId}")
  @PreAuthorize("hasRole('PROFESOR')")
  public ResponseEntity<DtApiResponse<DtQuiz>> editQuiz(
      @PathVariable Long quizId,
      @RequestBody UpdateQuizRequest req
  ) {
    try {
        DtQuiz quiz = quizService.editQuiz(quizId, req);
        return ResponseEntity.ok(new DtApiResponse<>(
                true,
                200,
                "Quiz editado",
                quiz
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

  @Operation(
      summary = "Eliminar quiz",
      description = "Elimina un quiz existente. Solo profesores",
      security = @SecurityRequirement(name = "bearerAuth")
  )
  @ApiResponse(responseCode = "200", description = "Quiz eliminado")
  @ApiResponse(responseCode = "403", description = "No tiene permisos")
  @ApiResponse(responseCode = "404", description = "Quiz no encontrado")
  @DeleteMapping("/{quizId}")
  @PreAuthorize("hasRole('PROFESOR')")
  public ResponseEntity<DtApiResponse<Void>> deleteQuiz(
      @PathVariable Long quizId
  ) {
    try {
        quizService.deleteQuiz(quizId);
        return ResponseEntity.ok(new DtApiResponse<>(
                true,
                200,
                "Quiz eliminado",
                null
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

  @Operation(
    summary = "Crear submission de quiz",
    description = "Crea una respuesta simple para un quiz. Solo estudiantes",
    security = @SecurityRequirement(name = "bearerAuth")
  )
  @ApiResponse(responseCode = "200", description = "Respuesta a quiz creada")
  @ApiResponse(responseCode = "400", description = "Datos inválidos")
  @ApiResponse(responseCode = "403", description = "No tiene permisos")
  @ApiResponse(responseCode = "404", description = "Quiz o usuario no encontrado")
  @PostMapping("/{quizId}/submission")
  @PreAuthorize("hasRole('ESTUDIANTE')")
  public ResponseEntity<DtApiResponse<DtQuizSubmission>> createQuizSubmission(
      @PathVariable Long quizId,
      @RequestBody CreateQuizSubmissionRequest req,
      Authentication authentication
  ) {
    try {
      String userCi = authentication.getName();
      DtQuizSubmission submission = quizService.createQuizSubmission(quizId, userCi, req);
      return ResponseEntity.ok(new DtApiResponse<>(
          true,
          HttpStatus.OK.value(),
          "Respuesta a quiz creada correctamente",
          submission
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

  @Operation(
    summary = "Obtener mi submission de quiz",
    description = "Devuelve la respuesta del usuario autenticado para el quiz (si existe)",
    security = @SecurityRequirement(name = "bearerAuth")
  )
  @ApiResponse(responseCode = "200", description = "Respuesta obtenida")
  @ApiResponse(responseCode = "404", description = "Quiz no encontrado")
  @GetMapping("/{quizId}/submission")
  @PreAuthorize("hasAnyRole('PROFESOR','ESTUDIANTE')")
  public ResponseEntity<DtApiResponse<DtQuizSubmission>> getMyQuizSubmission(
      @PathVariable Long quizId,
      Authentication authentication
  ) {
    try {
      String userCi = authentication.getName();
      DtQuizSubmission submission = quizService.getUserQuizSubmission(quizId, userCi);
      return ResponseEntity.ok(new DtApiResponse<>(
          true,
          HttpStatus.OK.value(),
          "Respuesta obtenida",
          submission
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

  @Operation(
    summary = "Listar submissions de un quiz",
    description = "Lista todas las respuestas del quiz (solo profesores)",
    security = @SecurityRequirement(name = "bearerAuth")
  )
  @ApiResponse(responseCode = "200", description = "Respuestas listadas")
  @ApiResponse(responseCode = "403", description = "No tiene permisos")
  @ApiResponse(responseCode = "404", description = "Quiz no encontrado")
  @GetMapping("/{quizId}/submissions")
  @PreAuthorize("hasRole('PROFESOR')")
  public ResponseEntity<DtApiResponse<java.util.List<DtQuizSubmission>>> getQuizSubmissions(
      @PathVariable Long quizId
  ) {
    try {
      java.util.List<DtQuizSubmission> submissions = quizService.getQuizSubmissions(quizId);
      return ResponseEntity.ok(new DtApiResponse<>(
          true,
          HttpStatus.OK.value(),
          "Respuestas listadas",
          submissions
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
}

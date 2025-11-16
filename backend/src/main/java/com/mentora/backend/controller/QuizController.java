package com.mentora.backend.controller;

import com.mentora.backend.dt.DtQuiz;
import com.mentora.backend.requests.UpdateQuizRequest;
import com.mentora.backend.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
}

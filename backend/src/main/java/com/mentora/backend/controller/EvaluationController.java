package com.mentora.backend.controller;

import com.mentora.backend.dt.DtEvaluation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.mentora.backend.responses.DtApiResponse;
import com.mentora.backend.service.EvaluationService;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.mentora.backend.requests.CreateEvaluationSubmissionRequest;
import com.mentora.backend.requests.UpdateEvaluationRequest;

import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import com.mentora.backend.dt.DtEvaluationSubmission;
import com.mentora.backend.responses.GetEvaluationWithSubmissionResponse;

@RestController
@RequestMapping("/evaluations")
public class EvaluationController {
  private final EvaluationService evaluationService;

  public EvaluationController(EvaluationService evaluationService) {
    this.evaluationService = evaluationService;
  }

  @Operation(summary = "Obtener evaluación con respuesta",
    description = "Obtiene una evaluación por su ID y su respuesta",
    security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponse(responseCode = "200", description = "Evaluación obtenida correctamente")
  @ApiResponse(responseCode = "404", description = "Evaluación no encontrada")
  @ApiResponse(responseCode = "500", description = "Error interno del servidor")
  @GetMapping("/{evaluationId}")
  public ResponseEntity<DtApiResponse<GetEvaluationWithSubmissionResponse>> getEvaluation(
    @PathVariable Long evaluationId,
    Authentication authentication
  ) {
    try {
      String userCi = authentication.getName();

      GetEvaluationWithSubmissionResponse evaluation = evaluationService.getEvaluation(evaluationId, userCi);

      return ResponseEntity.ok(new DtApiResponse<>(
        true,
        HttpStatus.OK.value(),
        "Evaluación obtenida correctamente",
        evaluation
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

  @Operation(summary = "Crea una respuesta a una evaluación",
    description = "Crea una respuesta a una evaluación",
    security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponse(responseCode = "200", description = "Respuesta creada correctamente")
  @ApiResponse(responseCode = "404", description = "Evaluación o usuario no encontrado")
  @ApiResponse(responseCode = "500", description = "Error interno del servidor")
  @PostMapping(value = "/{evaluationId}/response", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @PreAuthorize("hasRole('ESTUDIANTE')")
  public ResponseEntity<DtApiResponse<DtEvaluationSubmission>> createResponse(
    @PathVariable
    Long evaluationId,
    @ModelAttribute CreateEvaluationSubmissionRequest req,
    Authentication authentication
  ) {
    try {
      String userCi = authentication.getName();
      DtEvaluationSubmission response = evaluationService.createEvaluationSubmission(evaluationId, userCi, req);

      return ResponseEntity.ok(new DtApiResponse<>(
        true,
        HttpStatus.OK.value(),
        "Respuesta a evaluación creada correctamente",
        response
      ));
    } catch (ResponseStatusException e) {
      return ResponseEntity.status(e.getStatusCode()).body(new DtApiResponse<>(
          false,
          e.getStatusCode().value(),
          e.getReason(),
          null
      ));
    } catch (IOException e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new DtApiResponse<>(
          false,
          HttpStatus.INTERNAL_SERVER_ERROR.value(),
          e.getMessage(),
          null
      ));
    }

  }

  @Operation(
    summary = "Editar evaluación",
    description = "Actualiza una evaluación existente. Solo profesores",
    security = @SecurityRequirement(name = "bearerAuth")
  )
  @ApiResponse(responseCode = "200", description = "Evaluación actualizada")
  @ApiResponse(responseCode = "404", description = "Evaluación no encontrada")
  @ApiResponse(responseCode = "403", description = "No tiene permisos necesarios")
  @PreAuthorize("hasRole('PROFESOR')")
  @PutMapping(value = "/{evaluationId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<DtApiResponse<DtEvaluation>> updateEvaluation(
    @PathVariable Long evaluationId,
    @ModelAttribute UpdateEvaluationRequest req)
  {
    try {
        DtEvaluation updated = evaluationService.updateEvaluation(evaluationId, req);

        return ResponseEntity.ok(
            new DtApiResponse<>(true, 200, "Evaluación actualizada", updated)
        );

    } catch (ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(
                new DtApiResponse<>(false, e.getStatusCode().value(), e.getReason(), null)
        );
    } catch (IOException e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new DtApiResponse<>(false, HttpStatus.INTERNAL_SERVER_ERROR.value(), e.getMessage(), null));
    }
  }
}

package com.mentora.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.security.access.prepost.PreAuthorize;
import com.mentora.backend.responses.DtApiResponse;
import com.mentora.backend.dt.DtSimpleContent;
import com.mentora.backend.service.CourseService;
import com.mentora.backend.requests.CreateSimpleContentRequest;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/contents")
public class ContentController {

    private final CourseService courseService;

    public ContentController(CourseService courseService) {
        this.courseService = courseService;
    }

    @Operation(
      summary = "Editar contenido simple",
      description = "Actualiza un contenido simple existente. Solo profesores",
      security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "200", description = "Contenido simple actualizado")
    @ApiResponse(responseCode = "404", description = "Contenido no encontrado")
    @PutMapping(value ="/simple/{contentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PROFESOR')")
    public ResponseEntity<DtApiResponse<DtSimpleContent>> updateSimpleContent(
        @PathVariable Long contentId,
        @ModelAttribute CreateSimpleContentRequest req
    ) {
      try {
          DtSimpleContent updated = courseService.updateSimpleContent(contentId, req);

          return ResponseEntity.ok(new DtApiResponse<>(
            true,
            200,
            "Contenido simple actualizado",
            updated
            )
          );
      } catch (ResponseStatusException e) {
          return ResponseEntity.status(e.getStatusCode()).body(
              new DtApiResponse<>(
                false,
                e.getStatusCode().value(),
                e.getReason(),
                null
              )
          );
      } catch (IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
          new DtApiResponse<>(
            false,
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Error al actualizar el contenido simple",
            null
          )
        );
      }
    }

    @Operation(
      summary = "Eliminar contenido temático",
      description = "Elimina un contenido temático de un curso según su tipo e ID. Solo profesores",
      security = @SecurityRequirement(name = "bearerAuth")
      )
      @ApiResponse(responseCode = "200", description = "Contenido eliminado correctamente")
      @ApiResponse(responseCode = "400", description = "Parámetros inválidos")
      @ApiResponse(responseCode = "403", description = "No tiene permisos necesarios")
      @ApiResponse(responseCode = "404", description = "Contenido no encontrado")
      @DeleteMapping("/{type}/{id}")
      @PreAuthorize("hasRole('PROFESOR')")
      public ResponseEntity<DtApiResponse<Void>> deleteContent(
            @PathVariable String type,
            @PathVariable Long id
      ) {
        try {
          courseService.deleteContent(type, id);

          return ResponseEntity.ok(new DtApiResponse<>(
            true,
            200,
            "Contenido eliminado correctamente",
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

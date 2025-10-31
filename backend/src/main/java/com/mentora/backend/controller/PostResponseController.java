package com.mentora.backend.controller;

import com.mentora.backend.dt.DtPostResponse;
import com.mentora.backend.service.PostResponseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/post-response")
public class PostResponseController {

    private final PostResponseService postResponseService;

    public PostResponseController(PostResponseService postResponseService) {
        this.postResponseService = postResponseService;
    }

    @Operation(summary = "Crear una respuesta a un post",
            description = "Permite a estudiantes o profesores responder un post de foro de consultas",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Respuesta creada correctamente")
    @ApiResponse(responseCode = "404", description = "Post o usuario no encontrado")
    @PostMapping("/{postId}")
    public ResponseEntity<DtPostResponse> createResponse(@PathVariable Long postId,
                                                         @RequestBody DtPostResponse responseDto,
                                                         Authentication authentication) {
        String authorCi = authentication.getName();
        DtPostResponse created = postResponseService.createResponse(postId, authorCi, responseDto.getMessage());
        return ResponseEntity.ok(created);
    }

    @Operation(summary = "Listar respuestas de un post",
            description = "Devuelve todas las respuestas asociadas a un post de foro de consultas",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Respuestas obtenidas correctamente")
    @ApiResponse(responseCode = "404", description = "Post no encontrado")
    @GetMapping("/{postId}")
    public ResponseEntity<List<DtPostResponse>> getResponses(@PathVariable Long postId) {
        return ResponseEntity.ok(postResponseService.getResponsesForPost(postId));
    }
}

package com.mentora.backend.controller;

import com.mentora.backend.dt.DtPost;
import com.mentora.backend.requests.CreatePostRequest;
import com.mentora.backend.service.ForumService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.mentora.backend.responses.DtApiResponse;

import java.util.List;

@RestController
@RequestMapping("/forum")
public class ForumController {

    private final ForumService forumService;

    public ForumController(ForumService forumService) {
        this.forumService = forumService;
    }

    @Operation(
            summary = "Publicar un nuevo post en un foro",
            description = "Permite publicar un post en un foro.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Post publicado correctamente")
    @ApiResponse(responseCode = "403", description = "No tienes permisos para publicar en este foro")
    @ApiResponse(responseCode = "404", description = "Foro no encontrado")
    @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    @PreAuthorize("hasAnyRole('PROFESOR','ESTUDIANTE')")
    @PostMapping("/{forumId}")
    public ResponseEntity<DtApiResponse<DtPost>> publishPost(
            @PathVariable Long forumId,
            @RequestBody CreatePostRequest req,
            Authentication authentication
        ) {
            try {
                String professorCi = authentication.getName();

                DtPost created = forumService.publishPost(forumId, professorCi, req.getMessage());

                return ResponseEntity.ok().body(new DtApiResponse<>(
                    true,
                    HttpStatus.OK.value(),
                    "Post publicado correctamente",
                    created
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
            summary = "Obtener posts de un foro",
            description = "Devuelve todos los posts publicados en el foro.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Lista de posts obtenida correctamente")
    @ApiResponse(responseCode = "404", description = "Foro no encontrado")
    @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    @PreAuthorize("hasAnyRole('PROFESOR','ESTUDIANTE')")
    @GetMapping("/{forumId}")
    public ResponseEntity<DtApiResponse<List<DtPost>>> getPostsByForum(@PathVariable Long forumId) {
        try {
            List<DtPost> posts = forumService.getPostsByForum(forumId);
            return ResponseEntity.ok(new DtApiResponse<>(
                true,
                HttpStatus.OK.value(),
                "Lista de posts obtenida correctamente",
                posts
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


package com.mentora.backend.controller;

import com.mentora.backend.dt.DtPost;
import com.mentora.backend.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/post")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @Operation(
            summary = "Publicar un nuevo post en el foro de anuncios",
            description = "Permite a un profesor publicar un post en la cartelera de un curso.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Post publicado correctamente",
            content = @Content(schema = @Schema(implementation = DtPost.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos o curso inexistente")
    @ApiResponse(responseCode = "403", description = "No tiene permisos para publicar en el curso")
    @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    @PreAuthorize("hasRole('PROFESOR')")
    @PostMapping("/{courseId}")
    public ResponseEntity<DtPost> publishPost(
            @PathVariable String courseId,
            @RequestBody DtPost postDto,
            Authentication authentication) {

        String professorCi = authentication.getName();
        DtPost created = postService.publishPost(courseId, professorCi, postDto);
        return ResponseEntity.ok(created);
    }

    @Operation(
            summary = "Obtener posts de un curso",
            description = "Devuelve todos los posts publicados en la cartelera de un curso.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Lista de posts obtenida correctamente",
            content = @Content(schema = @Schema(implementation = DtPost.class)))
    @ApiResponse(responseCode = "404", description = "Curso no encontrado")
    @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{courseId}")
    public ResponseEntity<List<DtPost>> getPostsByCourse(@PathVariable String courseId) {
        List<DtPost> posts = postService.getPostsByCourse(courseId);
        return ResponseEntity.ok(posts);
    }
}

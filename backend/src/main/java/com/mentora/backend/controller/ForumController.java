package com.mentora.backend.controller;

import com.mentora.backend.dt.DtPost;
import com.mentora.backend.service.ForumService;
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
    @ApiResponse(responseCode = "200", description = "Post publicado correctamente",
            content = @Content(schema = @Schema(implementation = DtPost.class)))
    @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    @PreAuthorize("hasRole('PROFESOR,ESTUDIANTE')")
    @PostMapping("/{forumId}")
    public ResponseEntity<DtPost> publishPost(
            @PathVariable Long forumId,
            @RequestBody DtPost postDto,
            Authentication authentication) {

        String professorCi = authentication.getName();
        DtPost created = forumService.publishPost(forumId, professorCi, postDto);
        return ResponseEntity.ok(created);
    }

//     @Operation(
//             summary = "Obtener posts de un curso",
//             description = "Devuelve todos los posts publicados en la cartelera de un curso.",
//             security = @SecurityRequirement(name = "bearerAuth"))
//     @ApiResponse(responseCode = "200", description = "Lista de posts obtenida correctamente",
//             content = @Content(schema = @Schema(implementation = DtPost.class)))
//     @ApiResponse(responseCode = "404", description = "Curso no encontrado")
//     @ApiResponse(responseCode = "500", description = "Error interno del servidor")
//     @PreAuthorize("isAuthenticated()")
//     @GetMapping("/{courseId}")
//     public ResponseEntity<List<DtPost>> getPostsByCourse(@PathVariable String courseId) {
//         List<DtPost> posts = postService.getPostsByCourse(courseId);
//         return ResponseEntity.ok(posts);
//     }
}

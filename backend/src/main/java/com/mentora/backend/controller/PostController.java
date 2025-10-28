package com.mentora.backend.controller;

import com.mentora.backend.dt.DtPost;
import com.mentora.backend.requests.CreatePostRequest;
import com.mentora.backend.responses.DtApiResponse;
import com.mentora.backend.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/post")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @Operation(
        summary = "Editar un post existente",
        description = "Permite al autor de un post editar su post. Solo el autor del post puede modificarlo.",
        security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Post editado correctamente"),
        @ApiResponse(responseCode = "403", description = "No tiene permisos para editar este post"),
        @ApiResponse(responseCode = "404", description = "Post no encontrado"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{postId}")
    public ResponseEntity<DtApiResponse<DtPost>> editPost(
            @PathVariable Long postId,
            @RequestBody CreatePostRequest req,
            Authentication authentication) {
        try {
                String userCi = authentication.getName();
                DtPost updated = postService.editPost(postId, userCi, req.getMessage());
                return ResponseEntity.ok(new DtApiResponse<>(
                    true,
                    HttpStatus.OK.value(),
                    "Post editado correctamente",
                    updated
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
            summary = "Eliminar un post existente",
            description = "Permite al autor de un post eliminarlo. Solo el autor del post puede eliminarlo.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Post eliminado correctamente"),
            @ApiResponse(responseCode = "403", description = "No tiene permisos para eliminar este post"),
            @ApiResponse(responseCode = "404", description = "Post no encontrado"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{postId}")
    public ResponseEntity<DtApiResponse<Void>> deletePost(
            @PathVariable Long postId,
            Authentication authentication
        ) {
        try {
            String userCi = authentication.getName();
            postService.deletePost(postId, userCi);
            return ResponseEntity.ok(new DtApiResponse<>(
                true,
                HttpStatus.OK.value(),
                "Post eliminado correctamente",
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

package com.mentora.backend.controller;

import com.mentora.backend.dto.DtAdvert;
import com.mentora.backend.service.AdvertService;
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
@RequestMapping("/advert")
public class AdvertController {

    private final AdvertService advertService;

    public AdvertController(AdvertService advertService) {
        this.advertService = advertService;
    }

    @Operation(
            summary = "Publicar un nuevo anuncio",
            description = "Permite a un profesor publicar un anuncio en la cartelera de un curso.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Anuncio publicado correctamente",
            content = @Content(schema = @Schema(implementation = DtAdvert.class)))
    @ApiResponse(responseCode = "400", description = "Datos inválidos o curso inexistente")
    @ApiResponse(responseCode = "403", description = "No tiene permisos para publicar en el curso")
    @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    @PreAuthorize("hasRole('PROFESOR')")
    @PostMapping("/{courseId}")
    public ResponseEntity<DtAdvert> publishAdvert(
            @PathVariable String courseId,
            @RequestBody DtAdvert advertDto,
            Authentication authentication) {

        String professorCi = authentication.getName(); // obtenido del token
        DtAdvert created = advertService.publishAdvert(courseId, professorCi, advertDto);
        return ResponseEntity.ok(created);
    }

    @Operation(
            summary = "Obtener anuncios de un curso",
            description = "Devuelve todos los anuncios publicados en la cartelera de un curso.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Lista de anuncios obtenida correctamente",
            content = @Content(schema = @Schema(implementation = DtAdvert.class)))
    @ApiResponse(responseCode = "404", description = "Curso no encontrado")
    @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{courseId}")
    public ResponseEntity<List<DtAdvert>> getAdvertsByCourse(@PathVariable String courseId) {
        List<DtAdvert> adverts = advertService.getAdvertsByCourse(courseId);
        return ResponseEntity.ok(adverts);
    }
}

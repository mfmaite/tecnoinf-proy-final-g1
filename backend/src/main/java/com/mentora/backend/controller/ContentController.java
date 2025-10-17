package com.mentora.backend.controller;

import com.mentora.backend.dto.CreateContentRequest;
import com.mentora.backend.dto.ResponseDTO;
import com.mentora.backend.model.Content;
import com.mentora.backend.model.ContentType;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.UserRepository;
import com.mentora.backend.service.ContentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/contents")
public class ContentController {

    private final ContentService contentService;
    private final UserRepository userRepository;

    public ContentController(ContentService contentService, UserRepository userRepository) {
        this.contentService = contentService;
        this.userRepository = userRepository;
    }

    @PostMapping("/simple")
    @PreAuthorize("hasRole('PROFESOR')")
    public ResponseEntity<ResponseDTO<Content>> createSimpleContent(
            @PathVariable Long courseId,
            @RequestPart("content") CreateContentRequest req,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication
    ) throws IOException {
        req.setType(ContentType.SIMPLE);
        List<MultipartFile> files = (file != null) ? List.of(file) : List.of();
        return createContentBase(courseId, req, files, authentication);
    }

    @PostMapping("/file")
    @PreAuthorize("hasRole('PROFESOR')")
    public ResponseEntity<ResponseDTO<Content>> createFileContent(
            @PathVariable Long courseId,
            @RequestPart("content") CreateContentRequest req,
            @RequestPart("file") MultipartFile file,
            Authentication authentication
    ) throws IOException {
        req.setType(ContentType.FILE);
        return createContentBase(courseId, req, List.of(file), authentication);
    }

    @PostMapping("/evaluation")
    @PreAuthorize("hasRole('PROFESOR')")
    public ResponseEntity<ResponseDTO<Content>> createEvaluationContent(
            @PathVariable Long courseId,
            @RequestPart("content") CreateContentRequest req,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication
    ) throws IOException {
        req.setType(ContentType.EVALUATION);
        return createContentBase(courseId, req, (file != null) ? List.of(file) : List.of(), authentication);
    }

    @PostMapping("/quiz")
    @PreAuthorize("hasRole('PROFESOR')")
    public ResponseEntity<ResponseDTO<Content>> createQuizContent(
            @PathVariable Long courseId,
            @RequestPart("content") CreateContentRequest req,
            Authentication authentication
    ) throws IOException {
        req.setType(ContentType.QUIZ);
        return createContentBase(courseId, req, null, authentication);
    }

    @GetMapping
    public ResponseEntity<ResponseDTO<List<Content>>> listContents(@PathVariable Long courseId) {
        List<Content> contents = contentService.listByCourse(courseId);
        ResponseDTO<List<Content>> response = new ResponseDTO<>(
                true,
                HttpStatus.OK.value(),
                "Contenidos obtenidos correctamente",
                contents
        );
        return ResponseEntity.ok(response);
    }

    // Método base privado para no repetir lógica
    private ResponseEntity<ResponseDTO<Content>> createContentBase(
            Long courseId,
            CreateContentRequest req,
            List<MultipartFile> files,
            Authentication authentication
    ) throws IOException {
        String ci = authentication.getName();
        User user = userRepository.findById(ci)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));

        Content content = contentService.createContent(courseId, req, files, user);

        ResponseDTO<Content> response = new ResponseDTO<>(
                true,
                HttpStatus.CREATED.value(),
                "Contenido creado correctamente",
                content
        );

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}

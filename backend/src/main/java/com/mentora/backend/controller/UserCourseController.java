package com.mentora.backend.controller;

import com.mentora.backend.dto.ResponseDTO;
import com.mentora.backend.service.UserCourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/user-courses")
public class UserCourseController {

    private final UserCourseService userCourseService;

    public UserCourseController(UserCourseService userCourseService) {
        this.userCourseService = userCourseService;
    }

    // ================== Estudiantes ==================

    @PostMapping("/{courseId}/students/{studentCi}")
    @PreAuthorize("hasRole('PROFESOR')")
    @Operation(summary = "Matricular estudiante",
            description = "Matricula un estudiante a un curso si el profesor está asignado al curso",
            security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ResponseDTO<String>> enrollStudent(
            @PathVariable String courseId,
            @PathVariable String studentCi,
            Authentication authentication) {

        String professorCi = authentication.getName();
        String message = userCourseService.enrollStudent(courseId, professorCi, studentCi);

        return ResponseEntity.ok(new ResponseDTO<>(true, 200, message, studentCi));
    }

    @DeleteMapping("/{courseId}/students/{studentCi}")
    @PreAuthorize("hasRole('PROFESOR')")
    @Operation(summary = "Desmatricular estudiante",
            description = "Elimina un estudiante de un curso si el profesor está asignado",
            security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ResponseDTO<String>> unenrollStudent(
            @PathVariable String courseId,
            @PathVariable String studentCi,
            Authentication authentication) {

        String professorCi = authentication.getName();
        String message = userCourseService.unenrollStudent(courseId, professorCi, studentCi);

        return ResponseEntity.ok(new ResponseDTO<>(true, 200, message, studentCi));
    }

    @PostMapping("/{courseId}/students/csv")
    @PreAuthorize("hasRole('PROFESOR')")
    @Operation(summary = "Matricular estudiantes desde CSV",
            description = "Matricula varios estudiantes a un curso desde un archivo CSV",
            security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ResponseDTO<List<String>>> enrollStudentsCsv(
            @PathVariable String courseId,
            @RequestPart("file") MultipartFile file,
            Authentication authentication) throws IOException {

        String professorCi = authentication.getName();
        List<String> results = userCourseService.enrollStudentsFromCsv(courseId, professorCi, file);

        return ResponseEntity.ok(new ResponseDTO<>(true, 200, "Resultados del CSV", results));
    }

    @DeleteMapping("/{courseId}/students/csv")
    @PreAuthorize("hasRole('PROFESOR')")
    @Operation(summary = "Desmatricular estudiantes desde CSV",
            description = "Elimina varios estudiantes de un curso desde un CSV",
            security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ResponseDTO<List<String>>> unenrollStudentsCsv(
            @PathVariable String courseId,
            @RequestPart("file") MultipartFile file,
            Authentication authentication) throws IOException {

        String professorCi = authentication.getName();
        List<String> results = userCourseService.unenrollStudentsFromCsv(courseId, professorCi, file);

        return ResponseEntity.ok(new ResponseDTO<>(true, 200, "Resultados del CSV", results));
    }
}

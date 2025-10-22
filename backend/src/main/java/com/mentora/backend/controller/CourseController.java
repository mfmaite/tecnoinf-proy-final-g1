package com.mentora.backend.controller;

import com.mentora.backend.model.Role;
import com.mentora.backend.service.CourseService;
import com.mentora.backend.dt.DtCourse;
import com.mentora.backend.requests.CreateCourseRequest;
import com.mentora.backend.dt.DtSimpleContent;
import com.mentora.backend.requests.CreateSimpleContentRequest;
import com.mentora.backend.responses.DtApiResponse;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.mentora.backend.responses.GetCourseResponse;

import java.io.IOException;
import java.util.List;
@RestController
@RequestMapping("/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @Operation(summary = "Crear curso",
            description = "Crea un curso nuevo. Solo administradores",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Curso creado correctamente")
    @ApiResponse(responseCode = "400", description = "ID del curso obligatorio")
    @ApiResponse(responseCode = "409", description = "Ya existe un curso con ese ID")
    @ApiResponse(responseCode = "403", description = "No tiene permisos necesarios")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DtApiResponse<DtCourse>> createCourse(@RequestBody CreateCourseRequest req) {
        try {
            DtCourse created = courseService.createCourse(req);

            DtApiResponse<DtCourse> response = new DtApiResponse<>(
                    true,
                    200,
                    "Curso creado correctamente",
                    created
            );

            return ResponseEntity.ok(response);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new DtApiResponse<>(
                false,
                e.getStatusCode().value(),
                e.getReason(),
                null
            ));
        }
    }

    @Operation(summary = "Listar cursos",
            description = "Lista todos los cursos segun el rol del usuario",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Cursos obtenidos correctamente")
    @ApiResponse(responseCode = "403", description = "No tiene permisos necesarios")
    @GetMapping
    public ResponseEntity<DtApiResponse<List<DtCourse>>> listCourses(Authentication authentication) {
        try {
            String ci = authentication.getName();
            String roleString = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_ESTUDIANTE");
            Role role = Role.valueOf(roleString.replace("ROLE_", ""));

            List<DtCourse> courses = courseService.getCoursesForUser(ci, role);

            DtApiResponse<List<DtCourse>> response = new DtApiResponse<>(
                    true,
                    200,
                    "Cursos obtenidos correctamente",
                    courses
            );
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new DtApiResponse<>(
                false,
                e.getStatusCode().value(),
                e.getReason(),
                null
            ));
        }
    }

    @Operation(summary = "Vista de curso",
            description = "Retorna un curso y todos sus contenidos",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Curso y contenidos obtenidos correctamente")
    @ApiResponse(responseCode = "403", description = "No tiene permisos necesarios")
    @GetMapping(value = "/{courseId}")
    public ResponseEntity<DtApiResponse<GetCourseResponse>> getCourse(@PathVariable String courseId) {
        try {
            GetCourseResponse course = courseService.getCourseAndContents(courseId);

            DtApiResponse<GetCourseResponse> response = new DtApiResponse<>(
                true,
                200,
                "Curso y contenidos obtenidos correctamente",
                course
            );
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new DtApiResponse<>(
                false,
                e.getStatusCode().value(),
                e.getReason(),
                null
            ));
        }
    }

    @Operation(summary = "Crear contenido simple",
            description = "Crea un contenido simple para un curso. Solo profesores",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Contenido simple creado correctamente")
    @ApiResponse(responseCode = "400", description = "Contenido simple requiere texto o archivo")
    @ApiResponse(responseCode = "403", description = "No tiene permisos necesarios")
    @ApiResponse(responseCode = "500", description = "Error al crear contenido simple")
    @PostMapping(value = "/{courseId}/contents/simple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PROFESOR')")
    public ResponseEntity<DtApiResponse<DtSimpleContent>> createSimpleContent(
            @PathVariable String courseId,
            @ModelAttribute CreateSimpleContentRequest req,
            Authentication authentication
    ) {
        try {
            DtSimpleContent created = courseService.createSimpleContent(courseId, req);

            DtApiResponse<DtSimpleContent> response = new DtApiResponse<>(
                true,
                200,
                "Simple content created successfully",
                created
            );

            return ResponseEntity.ok(response);

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
}

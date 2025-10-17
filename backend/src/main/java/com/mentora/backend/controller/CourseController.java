package com.mentora.backend.controller;

import com.mentora.backend.dto.CreateCourseRequest;
import com.mentora.backend.dto.DtCourse;
import com.mentora.backend.dto.ResponseDTO;
import com.mentora.backend.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import com.mentora.backend.model.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

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
    public ResponseEntity<ResponseDTO<DtCourse>> createCourse(@RequestBody CreateCourseRequest req) {
        try {
            DtCourse created = courseService.createCourse(req);

            ResponseDTO<DtCourse> response = new ResponseDTO<>(
                    true,
                    200,
                    "Curso creado correctamente",
                    created
            );

            return ResponseEntity.ok(response);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new ResponseDTO<>(
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
    public ResponseEntity<ResponseDTO<List<DtCourse>>> listCourses(Authentication authentication) {
        try {
            String ci = authentication.getName();
            String roleString = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_ESTUDIANTE");
            Role role = Role.valueOf(roleString.replace("ROLE_", ""));

            List<DtCourse> courses = courseService.getCoursesForUser(ci, role);

            ResponseDTO<List<DtCourse>> response = new ResponseDTO<>(
                    true,
                    200,
                    "Cursos obtenidos correctamente",
                    courses
            );
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new ResponseDTO<>(
                false,
                e.getStatusCode().value(),
                e.getReason(),
                null
            ));
        }
    }
}

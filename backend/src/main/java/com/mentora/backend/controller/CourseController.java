package com.mentora.backend.controller;

import com.mentora.backend.dto.CreateCourseRequest;
import com.mentora.backend.dto.DtCourse;
import com.mentora.backend.dto.ResponseDTO;
import com.mentora.backend.model.Role;
import com.mentora.backend.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    @Operation(summary = "Listar cursos",
            description = "Lista todos los cursos según el rol del usuario")
    @ApiResponse(responseCode = "200", description = "Cursos obtenidos correctamente")
    public ResponseEntity<ResponseDTO<List<DtCourse>>> listCourses(Authentication authentication) {
        String ci = authentication.getName();
        String roleString = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_ESTUDIANTE");
        Role role = Role.valueOf(roleString.replace("ROLE_", ""));

        List<DtCourse> courses;

        // TODO: Consultar UserCourseService para obtener los cursos de profesores y estudiantes
        switch (role) {
            case ADMIN:
                courses = courseService.getAllCourses();
                break;
            case PROFESOR:
            case ESTUDIANTE:
                courses = courseService.getCoursesForUserCi(ci); // Este método aún lanza UnsupportedOperationException
                break;
            default:
                courses = List.of();
        }

        ResponseDTO<List<DtCourse>> response = new ResponseDTO<>(true, 200, "Cursos obtenidos correctamente", courses);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Crear curso",
            description = "Crea un curso nuevo. Solo administradores",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Curso creado correctamente")
    @ApiResponse(responseCode = "400", description = "ID del curso obligatorio")
    @ApiResponse(responseCode = "409", description = "Ya existe un curso con ese ID")
    public ResponseEntity<ResponseDTO<DtCourse>> createCourse(@RequestBody CreateCourseRequest req) {
        DtCourse created = courseService.createCourse(req);
        return ResponseEntity.ok(new ResponseDTO<>(true, 200, "Curso creado correctamente", created));
    }
}

package com.mentora.backend.controller;

import com.mentora.backend.dto.CreateCourseRequest;
import com.mentora.backend.dto.DtCourse;
import com.mentora.backend.dto.ResponseDTO;
import com.mentora.backend.model.Role;
import com.mentora.backend.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public ResponseEntity<ResponseDTO<List<DtCourse>>> listCourses(Authentication authentication) {

        String ci = authentication.getName();
        String roleString = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_ESTUDIANTE");
        Role role = Role.valueOf(roleString.replace("ROLE_", ""));

        List<DtCourse> courses = switch (role) {
            case ADMIN -> courseService.getAllCourses();
            case PROFESOR -> courseService.getCoursesForProfessorCi(ci);
            case ESTUDIANTE -> courseService.getCoursesForStudentCi(ci);
            default -> List.of();
        };

        ResponseDTO<List<DtCourse>> response = new ResponseDTO<>(
                true,
                200,
                "Cursos obtenidos correctamente",
                courses
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO<DtCourse>> createCourse(@RequestBody CreateCourseRequest req) {
        DtCourse created = courseService.createCourse(req);
        ResponseDTO<DtCourse> response = new ResponseDTO<>(
                true,
                200,
                "Curso creado correctamente",
                created
        );
        return ResponseEntity.ok(response);
    }
}

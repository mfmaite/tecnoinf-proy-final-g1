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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

        ResponseDTO<List<DtCourse>> response = new ResponseDTO<>(true, 200, "Cursos obtenidos correctamente", courses);
        return ResponseEntity.ok(response);
    }

    // Matricular estudiante individual
    @PostMapping("/{courseId}/students/{studentCi}")
    @PreAuthorize("hasRole('PROFESOR')")
    public ResponseEntity<ResponseDTO<String>> enrollStudent(
            @PathVariable String courseId,
            @PathVariable String studentCi,
            Authentication authentication) {

        String professorCi = authentication.getName();
        String message = courseService.enrollStudent(courseId, professorCi, studentCi);

        ResponseDTO<String> response = new ResponseDTO<>(true, 200, message, studentCi);
        return ResponseEntity.ok(response);
    }

    // Matricular estudiantes desde CSV
    @PostMapping("/{courseId}/students/csv")
    @PreAuthorize("hasRole('PROFESOR')")
    public ResponseEntity<ResponseDTO<List<String>>> enrollStudentsCsv(
            @PathVariable String courseId,
            @RequestPart("file") MultipartFile file,
            Authentication authentication) throws IOException {

        String professorCi = authentication.getName();
        List<String> enrolled = courseService.enrollStudentsFromCsv(courseId, professorCi, file);

        ResponseDTO<List<String>> response = new ResponseDTO<>(true, 200, "Resultados del CSV", enrolled);
        return ResponseEntity.ok(response);
    }

    // Desmatricular estudiante individual
    @DeleteMapping("/{courseId}/students/{studentId}")
    @PreAuthorize("hasRole('PROFESOR')")
    public ResponseEntity<ResponseDTO<String>> unenrollStudent(
            @PathVariable String courseId,
            @PathVariable String studentId,
            Authentication authentication) {

        String professorCi = authentication.getName();
        String message = courseService.unenrollStudent(courseId, professorCi, studentId);

        ResponseDTO<String> response = new ResponseDTO<>(true, 200, message, studentId);
        return ResponseEntity.ok(response);
    }

    // Desmatricular estudiantes desde CSV
    @DeleteMapping("/{courseId}/students/csv")
    @PreAuthorize("hasRole('PROFESOR')")
    public ResponseEntity<ResponseDTO<List<String>>> unenrollStudentsCsv(
            @PathVariable String courseId,
            @RequestPart("file") MultipartFile file,
            Authentication authentication) throws IOException {

        String professorCi = authentication.getName();
        List<String> removed = courseService.unenrollStudentsFromCsv(courseId, professorCi, file);

        ResponseDTO<List<String>> response = new ResponseDTO<>(true, 200, "Resultados del CSV", removed);
        return ResponseEntity.ok(response);
    }

    // Crear curso
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO<DtCourse>> createCourse(@RequestBody CreateCourseRequest req) {
        DtCourse created = courseService.createCourse(req);
        ResponseDTO<DtCourse> response = new ResponseDTO<>(true, 200, "Curso creado correctamente", created);
        return ResponseEntity.ok(response);
    }
}

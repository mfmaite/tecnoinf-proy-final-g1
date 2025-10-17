package com.mentora.backend.service;

import com.mentora.backend.dto.CreateCourseRequest;
import com.mentora.backend.dto.DtCourse;
import com.mentora.backend.model.Course;
import com.mentora.backend.model.Role;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.CourseRepository;
import com.mentora.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseService(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<DtCourse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DtCourse> getCoursesForProfessorCi(String ci) {
        User professor = userRepository.findById(ci)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Profesor no encontrado"));

        return courseRepository.findByProfessorsContains(professor).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DtCourse> getCoursesForStudentCi(String ci) {
        User student = userRepository.findById(ci)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Estudiante no encontrado"));

        return courseRepository.findByStudentsContains(student).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DtCourse createCourse(CreateCourseRequest req) {
        if (req.getId() == null || req.getId().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El ID del curso es obligatorio");

        if (courseRepository.existsById(req.getId()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un curso con ese ID");

        Course course = new Course();
        course.setId(req.getId());
        course.setName(req.getName());

        if (req.getProfessorCis() != null) {
            Set<User> profs = req.getProfessorCis().stream()
                    .map(ci -> userRepository.findById(ci)
                            .orElseThrow(() -> new NoSuchElementException("Profesor ci=" + ci + " no encontrado")))
                    .collect(Collectors.toSet());
            course.setProfessors(profs);
        }

        Course saved = courseRepository.save(course);
        return toDto(saved);
    }

    @Transactional
    public String enrollStudent(String courseId, String professorCi, String studentCi) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        User professor = userRepository.findById(professorCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Profesor no encontrado"));

        if (!course.getProfessors().contains(professor))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Profesor no asignado a este curso");

        User student = userRepository.findById(studentCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudiante no encontrado"));

        if (student.getRole() != Role.ESTUDIANTE)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario no es estudiante");

        if (!course.getStudents().add(student))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estudiante ya estaba matriculado");

        courseRepository.save(course);
        return "Estudiante matriculado correctamente";
    }

    @Transactional
    public String unenrollStudent(String courseId, String professorCi, String studentCi) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        User professor = userRepository.findById(professorCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Profesor no encontrado"));

        if (!course.getProfessors().contains(professor))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Profesor no asignado a este curso");

        User student = userRepository.findById(studentCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudiante no encontrado"));

        if (!course.getStudents().remove(student))
            return "Estudiante no estaba previamente matriculado";

        courseRepository.save(course);
        return "Estudiante desmatriculado correctamente";
    }

    @Transactional
    public List<String> enrollStudentsFromCsv(String courseId, String professorCi, MultipartFile file) throws IOException {
        List<String> results = new ArrayList<>();
        Course course = checkCourseForProfessor(courseId, professorCi);

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            while ((line = br.readLine()) != null) {
                String ci = line.trim();
                if (ci.isEmpty()) continue;

                User student = userRepository.findById(ci)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudiante ci=" + ci + " no encontrado"));

                if (student.getRole() != Role.ESTUDIANTE) {
                    results.add(ci + " no es estudiante");
                    continue;
                }

                if (!course.getStudents().add(student))
                    results.add(ci + " ya estaba matriculado");
                else
                    results.add(ci + " matriculado correctamente");
            }
        }

        courseRepository.save(course);
        return results;
    }

    @Transactional
    public List<String> unenrollStudentsFromCsv(String courseId, String professorCi, MultipartFile file) throws IOException {
        List<String> results = new ArrayList<>();
        Course course = checkCourseForProfessor(courseId, professorCi);

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            while ((line = br.readLine()) != null) {
                String ci = line.trim();
                if (ci.isEmpty()) continue;

                User student = userRepository.findById(ci)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudiante ci=" + ci + " no encontrado"));

                if (!course.getStudents().remove(student))
                    results.add(ci + " no estaba previamente matriculado");
                else
                    results.add(ci + " desmatriculado correctamente");
            }
        }

        courseRepository.save(course);
        return results;
    }

    private Course checkCourseForProfessor(String courseId, String professorCi) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        User professor = userRepository.findById(professorCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Profesor no encontrado"));

        if (!course.getProfessors().contains(professor)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Profesor no asignado a este curso");
        }

        return course;
    }

    private DtCourse toDto(Course c) {
        Set<String> profCis = c.getProfessors() == null ? Collections.emptySet()
                : c.getProfessors().stream().map(User::getCi).collect(Collectors.toSet());
        Set<String> studCis = c.getStudents() == null ? Collections.emptySet()
                : c.getStudents().stream().map(User::getCi).collect(Collectors.toSet());
        return new DtCourse(c.getId(), c.getName(), c.getCreationDate(), c.getGrade(), profCis, studCis);
    }
}

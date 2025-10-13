package com.mentora.backend.service;

import com.mentora.backend.dto.CreateCourseRequest;
import com.mentora.backend.dto.DtCourse;
import com.mentora.backend.model.Course;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.CourseRepository;
import com.mentora.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // Obtener todos los cursos (admin)
    @Transactional(readOnly = true)
    public List<DtCourse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Cursos para profesor (por CI desde token)
    @Transactional(readOnly = true)
    public List<DtCourse> getCoursesForProfessorCi(String ci) {
        Optional<User> profOpt = userRepository.findById(ci);
        return profOpt.map(user -> courseRepository.findByProfessorsContains(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList())).orElse(Collections.emptyList());
    }

    // Cursos para estudiante (por CI desde token)
    @Transactional(readOnly = true)
    public List<DtCourse> getCoursesForStudentCi(String ci) {
        Optional<User> studOpt = userRepository.findById(ci);
        return studOpt.map(user -> courseRepository.findByStudentsContains(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList())).orElse(Collections.emptyList());
    }

    // Crear curso (solo admin via controller con @PreAuthorize)
    @Transactional
    public DtCourse createCourse(CreateCourseRequest req) {
        Course c = new Course();
        c.setName(req.getName());

        // Vincular solo profesores
        if (req.getProfessorCis() != null) {
            Set<User> profs = req.getProfessorCis().stream()
                    .map(ci -> userRepository.findById(ci)
                            .orElseThrow(() -> new NoSuchElementException("Profesor ci=" + ci + " no encontrado")))
                    .collect(Collectors.toSet());
            c.setProfessors(profs);
        }

        // No se asignan estudiantes aquí

        Course saved = courseRepository.save(c);
        return toDto(saved);
    }


    private DtCourse toDto(Course c) {
        Set<String> profCis = c.getProfessors() == null ? Collections.emptySet()
                : c.getProfessors().stream().map(User::getCi).collect(Collectors.toSet());
        Set<String> studCis = c.getStudents() == null ? Collections.emptySet()
                : c.getStudents().stream().map(User::getCi).collect(Collectors.toSet());
        return new DtCourse(c.getId(), c.getName(), c.getCreationDate(), c.getGrade(), profCis, studCis);
    }
}

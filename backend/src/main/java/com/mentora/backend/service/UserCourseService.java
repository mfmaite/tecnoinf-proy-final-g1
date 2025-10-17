package com.mentora.backend.service;

import com.mentora.backend.model.Course;
import com.mentora.backend.model.Role;
import com.mentora.backend.model.User;
import com.mentora.backend.model.UserCourse;
import com.mentora.backend.repository.CourseRepository;
import com.mentora.backend.repository.UserCourseRepository;
import com.mentora.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserCourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final UserCourseRepository userCourseRepository;

    public UserCourseService(CourseRepository courseRepository, UserRepository userRepository,
                             UserCourseRepository userCourseRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.userCourseRepository = userCourseRepository;
    }

    @Transactional
    public String enrollStudent(String courseId, String professorCi, String studentCi) {
        Course course = checkCourseForProfessor(courseId, professorCi);

        User student = userRepository.findById(studentCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudiante no encontrado"));

        if (student.getRole() != Role.ESTUDIANTE)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario no es estudiante");

        if (userCourseRepository.existsByCourseAndUser(course, student))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estudiante ya estaba matriculado");

        UserCourse uc = new UserCourse(course, student, Role.ESTUDIANTE);
        userCourseRepository.save(uc);

        return "Estudiante matriculado correctamente";
    }

    @Transactional
    public String unenrollStudent(String courseId, String professorCi, String studentCi) {
        Course course = checkCourseForProfessor(courseId, professorCi);

        User student = userRepository.findById(studentCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudiante no encontrado"));

        UserCourse uc = userCourseRepository.findByCourseAndUser(course, student)
                .orElse(null);

        if (uc == null) return "Estudiante no estaba previamente matriculado";

        userCourseRepository.delete(uc);
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

                if (userCourseRepository.existsByCourseAndUser(course, student)) {
                    results.add(ci + " ya estaba matriculado");
                } else {
                    userCourseRepository.save(new UserCourse(course, student, Role.ESTUDIANTE));
                    results.add(ci + " matriculado correctamente");
                }
            }
        }

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

                UserCourse uc = userCourseRepository.findByCourseAndUser(course, student)
                        .orElse(null);

                if (uc == null) {
                    results.add(ci + " no estaba previamente matriculado");
                } else {
                    userCourseRepository.delete(uc);
                    results.add(ci + " desmatriculado correctamente");
                }
            }
        }

        return results;
    }

    /**
     * Valida que el curso exista y que el profesor esté asignado al curso
     */
    private Course checkCourseForProfessor(String courseId, String professorCi) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        userRepository.findById(professorCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Profesor no encontrado"));

        return course;
    }

    @Transactional(readOnly = true)
    public List<UserCourse> getUserCoursesByUserCi(String ci) {
        User user = userRepository.findById(ci)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        return userCourseRepository.findAllByUser(user);
    }

    @Transactional(readOnly = true)
    public Set<String> getUsersForCourseByRole(String courseId, Role role) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        return userCourseRepository.findAllByCourseAndRole(course, role).stream()
                .map(uc -> uc.getUser().getCi())
                .collect(Collectors.toSet());
    }
}

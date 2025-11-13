package com.mentora.backend.service;

import com.mentora.backend.dt.DtCourse;
import com.mentora.backend.dt.DtUser;
import com.mentora.backend.model.Course;
import com.mentora.backend.model.Role;
import com.mentora.backend.model.User;
import com.mentora.backend.model.UserCourse;
import com.mentora.backend.repository.CourseRepository;
import com.mentora.backend.repository.UserCourseRepository;
import com.mentora.backend.repository.UserRepository;
import com.mentora.backend.responses.BulkMatricularUsuariosResponse;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.exceptions.CsvException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserCourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final UserCourseRepository userCourseRepository;
    private final UserService userService;

    public UserCourseService(
        CourseRepository courseRepository,
        UserRepository userRepository,
        UserCourseRepository userCourseRepository,
        UserService userService
    ) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.userCourseRepository = userCourseRepository;
        this.userService = userService;
    }

    public String addUsersToCourse(String courseId, String[] usersCis) {
        List<String> errorUsers = new ArrayList<>();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        for (String userCi : usersCis) {
        User user = userRepository.findById(userCi).orElse(null);
        if (user == null) {
            errorUsers.add(userCi + " no existe");
            continue;
        }

        if (userCourseRepository.existsByCourseAndUser(course, user)) {
            errorUsers.add(userCi + " ya estaba matriculado");
            continue;
        }

        UserCourse uc = new UserCourse(course, user, null);
        userCourseRepository.save(uc);
        };

        if (!errorUsers.isEmpty()) {
            return "Algunos usuarios no se pudieron matricular: " + String.join(", ", errorUsers);
        }
        return "Usuarios matriculados correctamente";
    }

    public BulkMatricularUsuariosResponse addUsersToCourseFromCsv(String courseId, InputStream csvInputStream) throws IOException, CsvException {
        if (csvInputStream == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo CSV requerido");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        List<DtUser> matriculados = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        try (CSVReader reader = new CSVReaderBuilder(new InputStreamReader(csvInputStream, StandardCharsets.UTF_8)).build()) {
            List<String[]> rows = reader.readAll();
            if (rows == null || rows.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo CSV vacío");
            }

            int lineNumber = 0;
            for (String[] row : rows) {
                if (row == null) { continue; }
                //ignora la primera linea si es el header
                if (lineNumber == 1 && row.length > 0 && row[0] != null && row[0].trim().equalsIgnoreCase("ci")) {
                    continue;
                }

                String ci = row.length > 0 && row[0] != null ? row[0].trim() : "";
                if (ci.isEmpty()) {
                    errors.add("Fila " + lineNumber + ": CI obligatorio");
                    continue;
                }

                User user = userRepository.findById(ci).orElse(null);
                if (user == null) {
                    errors.add("Fila " + lineNumber + ": Usuario no encontrado");
                    continue;
                }

                if (userCourseRepository.existsByCourseAndUser(course, user)) {
                    errors.add("Fila " + lineNumber + ": Usuario ya matriculado");
                    continue;
                }

                UserCourse userCourse = new UserCourse(course, user, null);
                userCourseRepository.save(userCourse);
                matriculados.add(userService.getUserDto(user));
                lineNumber++;
            }
        } catch (CsvException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV inválido");
        }

        return new BulkMatricularUsuariosResponse(matriculados, errors);
    }

    public List<DtCourse> getCoursesForUser(String ci) {
        User user = userRepository.findById(ci).orElse(null);
        if (user == null) {
            return new ArrayList<>();
        }

        return userCourseRepository.findAllByUser(user).stream()
            .map(userCourse -> new DtCourse(userCourse.getCourse().getId(), userCourse.getCourse().getName(), userCourse.getCourse().getCreatedDate()))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    public String deleteUsersFromCourse(String courseId, String[] usersCis) {
        List<String> errorUsers = new ArrayList<>();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        for (String userCi : usersCis) {
            User user = userRepository.findById(userCi).orElse(null);
            if (user == null) {
                errorUsers.add(userCi + " no existe");
                continue;
            }

            UserCourse userCourse = userCourseRepository.findByCourseAndUser(course, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no matriculado en el curso"));
            userCourseRepository.delete(userCourse);
        }

        if (!errorUsers.isEmpty()) {
            return "Algunos usuarios no se pudieron desmatricular: " + String.join(", ", errorUsers);
        }
        return "Usuarios desmatriculados correctamente";
    }

    public List<DtUser> getParticipantsFromCourse(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        return userCourseRepository.findAllByCourse(course).stream()
            .map(userCourse -> userService.getUserDto(userCourse.getUser()))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    public List<DtUser> getNonParticipantsFromCourse(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        return userRepository.findAll().stream()
            .filter(user -> user.getRole() == Role.ESTUDIANTE)
            .filter(user -> !userCourseRepository.existsByCourseAndUser(course, user))
            .map(userService::getUserDto)
            .collect(Collectors.toCollection(ArrayList::new));
    }
}

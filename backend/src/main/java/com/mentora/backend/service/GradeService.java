package com.mentora.backend.service;

import com.mentora.backend.dt.DtFinalGrade;
import com.mentora.backend.model.Course;
import com.mentora.backend.model.User;
import com.mentora.backend.model.UserCourse;
import com.mentora.backend.repository.CourseRepository;
import com.mentora.backend.repository.UserCourseRepository;
import com.mentora.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;


@Service
public class GradeService {

    private final UserCourseRepository userCourseRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public GradeService(UserCourseRepository userCourseRepository,
                        CourseRepository courseRepository,
                        UserRepository userRepository,
                        NotificationService notificationService) {
        this.userCourseRepository = userCourseRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // Publicación individual
    public void publishFinalGrade(String courseId, DtFinalGrade gradeDto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        User user = userRepository.findById(gradeDto.getStudentCi())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudiante no encontrado"));

        UserCourse uc = userCourseRepository.findByCourseAndUser(course, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudiante no matriculado en el curso"));

        Integer grade = gradeDto.getGrade();
        if (grade < 1 || grade > 12)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nota debe estar entre 1 y 12");

        uc.setFinalGrade(grade);
        userCourseRepository.save(uc);

        // Envío de notificación
        notificationService.createNotification(
            user.getCi(),
            "Su calificación final del curso " + course.getName() + " ha sido publicada: " + grade,
            "/courses/" + course.getId() + "/grades"
        );
    }

    // Publicación masiva desde CSV
    public void publishFinalGradesCsv(String courseId, InputStream csvStream) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        List<DtFinalGrade> grades = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(csvStream))) {
            String line;
            int row = 1;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length != 2)
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CSV inválido en fila " + row);

                String ci = parts[0].trim();
                Integer grade;
                try { grade = Integer.parseInt(parts[1].trim()); }
                catch (NumberFormatException e) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nota inválida en fila " + row);
                }

                if (grade < 1 || grade > 12)
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nota fuera de rango en fila " + row);

                grades.add(new DtFinalGrade(ci, grade));
                row++;
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Error leyendo CSV");
        }

        // Validar todos antes de guardar
        for (DtFinalGrade g : grades) {
            userRepository.findById(g.getStudentCi())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estudiante no encontrado: " + g.getStudentCi()));
            userCourseRepository.findByCourseAndUser(course, userRepository.getReferenceById(g.getStudentCi()))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estudiante no matriculado: " + g.getStudentCi()));
        }

        // Guardar y notificar
        for (DtFinalGrade g : grades) {
            User user = userRepository.getReferenceById(g.getStudentCi());
            UserCourse uc = userCourseRepository.findByCourseAndUser(course, user).get();
            uc.setFinalGrade(g.getGrade());
            userCourseRepository.save(uc);

            notificationService.createNotification(
                user.getCi(),
                "Su calificación final del curso " + course.getName() + " ha sido publicada: " + g.getGrade(),
                "/courses/" + course.getId() + "/grades"
            );
        }
    }
}


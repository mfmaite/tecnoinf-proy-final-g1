package com.mentora.backend.service;

import com.mentora.backend.model.Course;
import com.mentora.backend.model.User;
import com.mentora.backend.model.UserCourse;
import com.mentora.backend.repository.CourseRepository;
import com.mentora.backend.repository.UserCourseRepository;
import com.mentora.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

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
}

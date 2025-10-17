package com.mentora.backend.service;

import com.mentora.backend.dto.CreateCourseRequest;
import com.mentora.backend.dto.DtCourse;
import com.mentora.backend.model.Course;
import com.mentora.backend.model.Role;
import com.mentora.backend.model.UserCourse;
import com.mentora.backend.repository.CourseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserCourseService userCourseService;

    public CourseService(CourseRepository courseRepository, UserCourseService userCourseService) {
        this.courseRepository = courseRepository;
        this.userCourseService = userCourseService;
    }

    @Transactional(readOnly = true)
    public List<DtCourse> getAllCourses() {
        return courseRepository.findAll().stream()
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

        Course saved = courseRepository.save(course);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<DtCourse> getCoursesForUserCi(String ci) {
        // Obtenemos los cursos del usuario a través de UserCourseService
        List<UserCourse> userCourses = userCourseService.getUserCoursesByUserCi(ci);

        return userCourses.stream()
                .map(UserCourse::getCourse)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private DtCourse toDto(Course c) {
        // Obtenemos los usuarios del curso desde UserCourseService
        Set<String> professorCis = userCourseService.getUsersForCourseByRole(c.getId(), Role.PROFESOR);
        Set<String> studentCis = userCourseService.getUsersForCourseByRole(c.getId(), Role.ESTUDIANTE);

        return new DtCourse(
                c.getId(),
                c.getName(),
                c.getCreationDate(),
                professorCis,
                studentCis
        );
    }
}

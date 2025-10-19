package com.mentora.backend.service;

import com.mentora.backend.dt.DtCourse;
import com.mentora.backend.model.Course;
import com.mentora.backend.model.Role;
import com.mentora.backend.repository.CourseRepository;
import com.mentora.backend.requests.CreateCourseRequest;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;

import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserCourseService userCourseService;

    public CourseService(CourseRepository courseRepository, UserCourseService userCourseService) {
        this.courseRepository = courseRepository;
        this.userCourseService = userCourseService;
    }

    public List<DtCourse> getCoursesForUser(String ci, Role role) {
        if (role == Role.ADMIN) {
            return courseRepository.findAll().stream()
                .map(this::getDtCourse)
                .collect(Collectors.toList());
        }

        return userCourseService.getCoursesForUser(ci).stream()
            .collect(Collectors.toCollection(ArrayList::new));
    }

    public DtCourse createCourse(CreateCourseRequest req) {
        if (courseRepository.existsById(req.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un curso con ese ID");
        }

        Course c = new Course(
            req.getId(),
            req.getName(),
            LocalDateTime.now()
        );

        Course saved = courseRepository.save(c);

        userCourseService.addUsersToCourse(req.getId(), req.getProfessorsCis());

        return getDtCourse(saved);
    }


    private DtCourse getDtCourse(Course c) {
        return new DtCourse(c.getId(), c.getName(), c.getCreatedDate());
    }
}

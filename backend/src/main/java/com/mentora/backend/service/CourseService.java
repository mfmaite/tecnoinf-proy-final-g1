package com.mentora.backend.service;

import com.mentora.backend.dto.CreateCourseRequest;
import com.mentora.backend.dto.DtCourse;
import com.mentora.backend.model.Course;
import com.mentora.backend.repository.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
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


    @Transactional
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

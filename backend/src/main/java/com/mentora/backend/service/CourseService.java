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
import com.mentora.backend.repository.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;

import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final UserCourseService userCourseService;

    public CourseService(CourseRepository courseRepository, UserRepository userRepository, UserCourseService userCourseService) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.userCourseService = userCourseService;
    }

    public List<DtCourse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::getDtCourse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DtCourse> getCoursesForProfessorCi(String ci) {
        // Optional<User> profOpt = userRepository.findById(ci);
        // return profOpt.map(user -> courseRepository.findByProfessorsContains(user).stream()
        //         .map(this::getDtCourse)
        //         .collect(Collectors.toList())).orElse(Collections.emptyList());

        return courseRepository.findAll().stream()
                .map(this::getDtCourse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DtCourse> getCoursesForStudentCi(String ci) {
        //Optional<User> studOpt = userRepository.findById(ci);
        // return studOpt.map(user -> courseRepository.findByStudentsContains(user).stream()
        //         .map(this::toDto)
        //         .collect(Collectors.toList())).orElse(Collections.emptyList());

        return courseRepository.findAll().stream()
                .map(this::getDtCourse)
                .collect(Collectors.toList());
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

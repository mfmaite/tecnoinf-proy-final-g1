package com.mentora.backend.service;

import com.mentora.backend.dt.DtCourse;
import com.mentora.backend.model.Course;
import com.mentora.backend.model.Role;
import com.mentora.backend.repository.CourseRepository;
import com.mentora.backend.requests.CreateCourseRequest;
import java.util.*;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.time.LocalDateTime;
import com.mentora.backend.dt.DtSimpleContent;
import com.mentora.backend.requests.CreateSimpleContentRequest;
import com.mentora.backend.model.SimpleContent;
import com.mentora.backend.repository.SimpleContentRepository;
import com.mentora.backend.dt.DtFileResource;


@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserCourseService userCourseService;
    private final SimpleContentRepository simpleContentRepository;
    private final FileStorageService fileStorageService;

    public CourseService(CourseRepository courseRepository, UserCourseService userCourseService, SimpleContentRepository simpleContentRepository, FileStorageService fileStorageService) {
        this.courseRepository = courseRepository;
        this.userCourseService = userCourseService;
        this.simpleContentRepository = simpleContentRepository;
        this.fileStorageService = fileStorageService;
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

    public DtSimpleContent createSimpleContent(String courseId, CreateSimpleContentRequest req) throws IOException {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        if (req.getFile() == null && req.getContent() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Contenido simple requiere texto o archivo");
        }

        String fileName = null;
        String fileUrl = null;
        String content = null;

        if (req.getFile() != null) {
            DtFileResource file = fileStorageService.store(req.getFile());
            fileName = file.getFilename();
            fileUrl = file.getStoragePath();
        }

        if (req.getContent() != null) {
            content = req.getContent();
        }

        SimpleContent newSimpleContent = new SimpleContent(req.getTitle(), course, fileName, fileUrl, content);
        SimpleContent saved = simpleContentRepository.save(newSimpleContent);

        return new DtSimpleContent(saved.getId(), saved.getTitle(), saved.getContent(), saved.getFileName(), saved.getFileUrl(), saved.getCreatedDate());
    }

    public String addParticipants(String courseId, String[] participantIds) {
        return userCourseService.addUsersToCourse(courseId, participantIds);
    }

    public String deleteParticipants(String courseId, String[] participantIds) {
        return userCourseService.deleteUsersFromCourse(courseId, participantIds);
    }
}

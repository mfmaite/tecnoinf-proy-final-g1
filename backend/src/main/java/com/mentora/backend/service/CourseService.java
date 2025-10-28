package com.mentora.backend.service;

import com.mentora.backend.dt.DtCourse;
import com.mentora.backend.dt.DtUser;
import com.mentora.backend.model.*;
import com.mentora.backend.repository.CourseRepository;
import com.mentora.backend.repository.ForumRepository;
import com.mentora.backend.requests.CreateCourseRequest;
import java.util.*;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.time.LocalDateTime;
import com.mentora.backend.dt.DtSimpleContent;
import com.mentora.backend.requests.CreateSimpleContentRequest;
import com.mentora.backend.repository.SimpleContentRepository;
import com.mentora.backend.dt.DtFileResource;
import com.mentora.backend.responses.GetCourseResponse;


@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserCourseService userCourseService;
    private final SimpleContentRepository simpleContentRepository;
    private final FileStorageService fileStorageService;
    private final ForumRepository  forumRepository;

    public CourseService(CourseRepository courseRepository, UserCourseService userCourseService, SimpleContentRepository simpleContentRepository, FileStorageService fileStorageService, ForumRepository forumRepository) {
        this.courseRepository = courseRepository;
        this.userCourseService = userCourseService;
        this.simpleContentRepository = simpleContentRepository;
        this.fileStorageService = fileStorageService;
        this.forumRepository = forumRepository;
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

        // Crear foros automaticamente al crear el curso
        Forum announcementsForum = new Forum(
                ForumType.ANNOUNCEMENTS,
                saved
        );
        forumRepository.save(announcementsForum);

        Forum consultsForum = new Forum(
                ForumType.CONSULTS,
                saved
        );
        forumRepository.save(consultsForum);

        // Asignar profesores al curso
        userCourseService.addUsersToCourse(req.getId(), req.getProfessorsCis());

        return getDtCourse(saved);
    }

    public GetCourseResponse getCourseAndContents(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        List<DtSimpleContent> contents = simpleContentRepository.findByCourse_IdOrderByCreatedDateAsc(course.getId()).stream()
                .map(this::getDtSimpleContent)
                .collect(Collectors.toList());

        return new GetCourseResponse(getDtCourse(course), contents);
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

        return getDtSimpleContent(saved);
    }

    private DtCourse getDtCourse(Course c) {
        return new DtCourse(c.getId(), c.getName(), c.getCreatedDate());
    }

    private DtSimpleContent getDtSimpleContent(SimpleContent sc) {
        return new DtSimpleContent(sc.getId(), sc.getTitle(), sc.getContent(), sc.getFileName(), sc.getFileUrl(), sc.getCreatedDate());
    }

    public String addParticipants(String courseId, String[] participantIds) {
        return userCourseService.addUsersToCourse(courseId, participantIds);
    }

    public String deleteParticipants(String courseId, String[] participantIds) {
        return userCourseService.deleteUsersFromCourse(courseId, participantIds);
    }

    public List<DtUser> getParticipants(String courseId) {
        return userCourseService.getUsersFromCourse(courseId);
    }
}

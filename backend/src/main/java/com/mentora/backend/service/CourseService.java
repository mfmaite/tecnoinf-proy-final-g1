package com.mentora.backend.service;

import com.mentora.backend.dto.CreateCourseRequest;
import com.mentora.backend.dto.DtCourse;
import com.mentora.backend.model.*;
import com.mentora.backend.repository.CourseRepository;
import com.mentora.backend.repository.EvaluationSubmissionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserCourseService userCourseService;
    private final FileStorageService fileStorageService;
    private final EvaluationSubmissionRepository evaluationSubmissionRepository;

    public CourseService(CourseRepository courseRepository,
                         UserCourseService userCourseService,
                         FileStorageService fileStorageService,
                         EvaluationSubmissionRepository evaluationSubmissionRepository) {
        this.courseRepository = courseRepository;
        this.userCourseService = userCourseService;
        this.fileStorageService = fileStorageService;
        this.evaluationSubmissionRepository = evaluationSubmissionRepository;
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
        List<UserCourse> userCourses = userCourseService.getUserCoursesByUserCi(ci);

        return userCourses.stream()
                .map(UserCourse::getCourse)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void postSubmission(String studentCi, String evaluationId, MultipartFile file) throws IOException {
        // Validar archivo
        long maxSize = 250L * 1024 * 1024;
        if (file.getSize() > maxSize)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo excede 250 MB");

        List<String> allowedExt = List.of(
                ".txt", ".doc", ".docx", ".odt",
                ".pdf", ".jpg", ".jpeg", ".png",
                ".mp4", ".mov", ".avi", ".mp3", ".wav"
        );
        String original = file.getOriginalFilename();
        boolean validExt = allowedExt.stream().anyMatch(ext -> original != null && original.toLowerCase().endsWith(ext));
        if (!validExt)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de archivo no permitido");

        // Guardar en GCS
        FileResource fr = fileStorageService.store(file);

        // Crear entrega
        EvaluationSubmission submission = new EvaluationSubmission();
        submission.setId(evaluationId + "_" + studentCi);
        submission.setFileName(fr.getFilename());
        submission.setFileUrl(fr.getStoragePath());
        submission.setNote(null);
        submission.setSolution(null);

        evaluationSubmissionRepository.save(submission);
    }

    private DtCourse toDto(Course c) {
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

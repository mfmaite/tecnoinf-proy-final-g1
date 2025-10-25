package com.mentora.backend.service;

import com.mentora.backend.dt.DtUser;
import com.mentora.backend.dto.DtAdvert;
import com.mentora.backend.model.*;
import com.mentora.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdvertService {

    private final AdvertRepository advertRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ForumRepository forumRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final UserCourseService userCourseService;

    public AdvertService(
            AdvertRepository advertRepository,
            CourseRepository courseRepository,
            UserRepository userRepository,
            ForumRepository forumRepository,
            EmailService emailService,
            NotificationService notificationService,
            UserCourseService userCourseService) {
        this.advertRepository = advertRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.forumRepository = forumRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.userCourseService = userCourseService;
    }

    // ============================
    // PUBLICAR ANUNCIO
    // ============================
    @Transactional
    public DtAdvert publishAdvert(String courseId, String professorCi, DtAdvert dto) {
        // Validar curso
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        // Validar profesor
        User professor = userRepository.findById(professorCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Profesor no encontrado"));

        // Validar que el profesor esté asignado al curso
        boolean isProfessor = userCourseService.getUsersFromCourse(courseId).stream()
                .filter(u -> u.getRole() == Role.PROFESOR)
                .anyMatch(p -> p.getCi().equals(professorCi));

        if (!isProfessor) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado para publicar en este curso");
        }

        // Obtener foro de anuncios
        Forum forum = forumRepository.findByCourseIdAndType(courseId, ForumType.ANNOUNCEMENTS)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Foro de anuncios no encontrado"));

        // Crear anuncio
        Advert advert = new Advert();
        advert.setForum(forum);
        advert.setAuthor(professor);
        advert.setContent(dto.getContent());
        advert.setCreatedAt(LocalDateTime.now());

        advertRepository.save(advert);

        // Notificar a los estudiantes del curso
        List<DtUser> studentsDto = userCourseService.getUsersFromCourse(courseId).stream()
                .filter(u -> u.getRole() == Role.ESTUDIANTE)
                .toList();

        for (DtUser studentDto : studentsDto) {
            User student = userRepository.findById(studentDto.getCi())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudiante no encontrado"));

            // Enviar correo
            emailService.sendEmail(student.getEmail(),
                    "Nuevo anuncio en " + course.getName(),
                    dto.getContent());

            // Crear notificación específica
            String link = "/forum/" + forum.getId() + "/message/" + advert.getId();
            notificationService.createNotification(student,
                    "Nuevo anuncio en " + course.getName(),
                    link);
        }

        return toDto(advert);
    }

    // ============================
    // OBTENER ANUNCIOS DE UN CURSO
    // ============================
    @Transactional(readOnly = true)
    public List<DtAdvert> getAdvertsByCourse(String courseId) {
        Forum forum = forumRepository.findByCourseIdAndType(courseId, ForumType.ANNOUNCEMENTS)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Foro de anuncios no encontrado"));

        List<Advert> adverts = advertRepository.findByForumIdOrderByCreatedAtDesc(forum.getId());
        return adverts.stream().map(this::toDto).collect(Collectors.toList());
    }

    // ============================
    // MAPPER ENTIDAD → DTO
    // ============================
    private DtAdvert toDto(Advert advert) {
        DtAdvert dto = new DtAdvert();
        dto.setId(advert.getId());
        dto.setAuthorCi(advert.getAuthor().getCi());
        dto.setAuthorName(advert.getAuthor().getName());
        dto.setCourseId(advert.getForum().getCourse().getId());
        dto.setContent(advert.getContent());
        dto.setCreatedAt(advert.getCreatedAt());
        return dto;
    }
}

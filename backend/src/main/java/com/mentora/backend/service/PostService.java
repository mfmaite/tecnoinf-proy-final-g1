package com.mentora.backend.service;

import com.mentora.backend.dt.DtPost;
import com.mentora.backend.dt.DtUser;
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
public class PostService {

    private final PostRepository postRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ForumRepository forumRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final UserCourseService userCourseService;

    public PostService(
            PostRepository postRepository,
            CourseRepository courseRepository,
            UserRepository userRepository,
            ForumRepository forumRepository,
            EmailService emailService,
            NotificationService notificationService,
            UserCourseService userCourseService) {
        this.postRepository = postRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.forumRepository = forumRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.userCourseService = userCourseService;
    }

    // ============================
    // PUBLICAR POST EN FORO
    // ============================
    @Transactional
    public DtPost publishPost(String courseId, String professorCi, DtPost dto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        User professor = userRepository.findById(professorCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Profesor no encontrado"));

        boolean isProfessor = userCourseService.getUsersFromCourse(courseId).stream()
                .filter(u -> u.getRole() == Role.PROFESOR)
                .anyMatch(p -> p.getCi().equals(professorCi));

        if (!isProfessor) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado para publicar en este curso");
        }

        Forum forum = forumRepository.findByCourseIdAndType(courseId, ForumType.ANNOUNCEMENTS)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Foro de anuncios no encontrado"));

        Post post = new Post();
        post.setForum(forum);
        post.setAuthor(professor);
        post.setMessage(dto.getMessage());
        post.setCreatedDate(LocalDateTime.now());

        postRepository.save(post);

        // Notificar a los estudiantes
        List<DtUser> studentsDto = userCourseService.getUsersFromCourse(courseId).stream()
                .filter(u -> u.getRole() == Role.ESTUDIANTE)
                .toList();

        for (DtUser studentDto : studentsDto) {
            User student = userRepository.findById(studentDto.getCi())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudiante no encontrado"));

            emailService.sendEmail(student.getEmail(),
                    "Nuevo anuncio en " + course.getName(),
                    dto.getMessage());

            String link = "/forum/" + forum.getId() + "/post/" + post.getId();
            notificationService.createNotification(student,
                    "Nuevo anuncio en " + course.getName(),
                    link);
        }

        return toDto(post);
    }

    // OBTENER POSTS DE UN CURSO

    @Transactional(readOnly = true)
    public List<DtPost> getPostsByCourse(String courseId) {
        Forum forum = forumRepository.findByCourseIdAndType(courseId, ForumType.ANNOUNCEMENTS)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Foro de anuncios no encontrado"));

        List<Post> posts = postRepository.findByForumIdOrderByCreatedDateDesc(forum.getId());
        return posts.stream().map(this::toDto).collect(Collectors.toList());
    }

    private DtPost toDto(Post post) {
        DtPost dto = new DtPost();
        dto.setId(post.getId());
        dto.setAuthorCi(post.getAuthor().getCi());
        dto.setAuthorName(post.getAuthor().getName());
        dto.setMessage(post.getMessage());
        dto.setCreatedDate(post.getCreatedDate());
        return dto;
    }

    public DtPost editPost(String postId, String userCi, DtPost postDto) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post no encontrado"));

        if (!post.getAuthor().getCi().equals(userCi))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tiene permisos para editar este post");

        post.setMessage(postDto.getMessage());
        Post updated = postRepository.save(post);
        return toDto(updated);
    }

    public void deletePost(String postId, String userCi) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post no encontrado"));

        if (!post.getAuthor().getCi().equals(userCi))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tiene permisos para eliminar este post");

        postRepository.delete(post);
    }


}

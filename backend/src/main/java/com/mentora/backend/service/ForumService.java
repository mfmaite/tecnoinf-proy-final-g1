package com.mentora.backend.service;

import com.mentora.backend.dt.DtPost;
import com.mentora.backend.dt.DtUser;
import com.mentora.backend.model.*;
import com.mentora.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ForumService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ForumRepository forumRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final UserCourseService userCourseService;

    public ForumService(
        PostRepository postRepository,
        UserRepository userRepository,
        ForumRepository forumRepository,
        EmailService emailService,
        NotificationService notificationService,
        UserCourseService userCourseService
    ) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.forumRepository = forumRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.userCourseService = userCourseService;
    }


    public DtPost publishPost(Long forumId, String authorCi, String message) {
        Forum forum = forumRepository.findById(forumId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Foro no encontrado"));

        User author = userRepository.findById(authorCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (forum.getType() == ForumType.ANNOUNCEMENTS && author.getRole() != Role.PROFESOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes publicar en este foro");
        }

        Post post = new Post(
            forum,
            author,
            message
        );

        postRepository.save(post);

        List<DtUser> studentsDto = userCourseService.getUsersFromCourse(forum.getCourse().getId()).stream()
                .filter(u -> u.getRole() == Role.ESTUDIANTE)
                .toList();

        // Envia mail de nueva publicación a todos los estudiantes
        for (DtUser studentDto : studentsDto) {
            emailService.sendEmail(studentDto.getEmail(),
                "Nuevo anuncio en " + forum.getCourse().getName(),
                message
            );

            String link = "/forum/" + forum.getId() + "/post/" + post.getId();

            notificationService.createNotification(
                studentDto.getCi(),
                "Nuevo anuncio en " + forum.getCourse().getName(),
                link
            );
        }

        return getDtPost(post);
    }

    public List<DtPost> getPostsByForum(Long forumId) {
        List<Post> posts = postRepository.findByForum_IdOrderByCreatedDateDesc(forumId);
        return posts.stream().map(this::getDtPost).toList();
    }

    private DtPost getDtPost(Post post) {
        DtPost dto = new DtPost(
            post.getId(),
            post.getAuthor().getCi(),
            post.getAuthor().getName(),
            post.getMessage(),
            post.getCreatedDate()
        );
        return dto;
    }
}

package com.mentora.backend.service;

import com.mentora.backend.model.*;
import com.mentora.backend.repository.EvaluationRepository;
import com.mentora.backend.repository.NotificationRepository;
import com.mentora.backend.repository.UserCourseRepository;
import com.mentora.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EvaluationRepository evaluationRepository;
    private final UserCourseRepository userCourseRepository;
    private final NotificationService  notificationService;
    private final EmailService emailService;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               EvaluationRepository evaluationRepository,
                               UserCourseRepository userCourseRepository,
                               NotificationService notificationService,
                               EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.evaluationRepository = evaluationRepository;
        this.userCourseRepository = userCourseRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    public Notification createNotification(String userCi, String message, String link) {
        User user = userRepository.findById(userCi)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        Notification notification = new Notification(user, message, link);

        return notificationRepository.save(notification);
    }

    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(Boolean.TRUE);
            notificationRepository.save(n);
        });
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByIdDesc(user);
    }

    @Scheduled(fixedRate = 10 * 60 * 1000) // Se ejecuta cada 10 minutos
    @Transactional
    public void sendDueSoonNotifications() {
        LocalDateTime now = LocalDateTime.now();

        List<Evaluation> pendingEvaluations = evaluationRepository.findAll()
                .stream()
                .filter(e -> !e.isNotified() && e.getDueDate() != null)
                .toList();

        for (Evaluation eval : pendingEvaluations) {
            LocalDateTime due = eval.getDueDate();

            // Ventana de 24 horas ±10 minutos
            LocalDateTime windowStart = now.plusHours(24).minusMinutes(10);
            LocalDateTime windowEnd = now.plusHours(24);

            if (!due.isBefore(windowStart) && !due.isAfter(windowEnd)) {
                // Todos los estudiantes del curso
                List<UserCourse> students = userCourseRepository.findAllByCourse(eval.getCourse());

                for (UserCourse uc : students) {
                    String studentCi = uc.getUser().getCi();
                    String message = "Atención: La evaluación '" + eval.getTitle() +
                            "' vence en 24 horas.";
                    String link = "/courses/" + eval.getCourse().getId() + "/evaluations/" + eval.getId();

                    // Notificación web
                    notificationService.createNotification(studentCi, message, link);

                    // Enviar email
                    String subject = "Evaluación próxima a vencer";
                    String body = "Hola " + uc.getUser().getName() + ",\n\n" +
                            "La evaluación '" + eval.getTitle() + "' del curso '" +
                            eval.getCourse().getName() + "' vence en 24 horas.\n" +
                            "Podés verla aquí: " + link + "\n\n¡No lo olvides!";
                    emailService.sendEmail(uc.getUser().getEmail(), subject, body);
                }

                // Marcamos la evaluación como notificada
                eval.setNotified(true);
                evaluationRepository.save(eval);
            }
        }
    }
}

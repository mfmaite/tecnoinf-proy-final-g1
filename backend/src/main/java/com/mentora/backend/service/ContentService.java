package com.mentora.backend.service;

import com.mentora.backend.requests.CreateContentRequest;
import com.mentora.backend.dt.QuizAnswerDto;
import com.mentora.backend.dt.QuizQuestionDto;
import com.mentora.backend.model.*;
import com.mentora.backend.repository.ContentRepository;
import com.mentora.backend.repository.CourseRepository;
import com.mentora.backend.repository.FileResourceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ContentService {

    private final ContentRepository contentRepo;
    private final FileStorageService storage;
    private final FileResourceRepository fileRepo;
    private final CourseRepository courseRepo;
    private final UserCourseService userCourseService;

    public ContentService(ContentRepository contentRepo,
                          FileStorageService storage,
                          FileResourceRepository fileRepo,
                          CourseRepository courseRepo,
                          UserCourseService userCourseService) {
        this.contentRepo = contentRepo;
        this.storage = storage;
        this.fileRepo = fileRepo;
        this.courseRepo = courseRepo;
        this.userCourseService = userCourseService;
    }

    @Transactional
    public Content createContent(Long courseId, CreateContentRequest req,
                                 List<MultipartFile> files, User user) throws IOException {

        // Buscar curso
        Course course = courseRepo.findById(courseId.toString())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        // Validar que profesor esté asignado al curso
        boolean isAssigned = userCourseService.getCoursesForUser(user.getCi()).stream()
                .anyMatch(c -> c.getId().equals(courseId));
        if (!isAssigned) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Profesor no asignado al curso");
        }

        // Validaciones según tipo de contenido
        validateContent(req, files);

        // Crear contenido
        Content content = new Content();
        content.setTitle(req.title);
        content.setMarkup(req.markup);
        content.setType(req.type);
        content.setDueDate(req.dueDate);
        content.setCourse(course);
        content.setCreator(user);

        // Inicializar listas para relaciones
        content.setFiles(new ArrayList<>());
        content.setQuestions(new ArrayList<>());

        contentRepo.save(content);

        // Guardar archivo si existe
        if (files != null && !files.isEmpty()) {
            MultipartFile f = files.get(0); // solo un archivo permitido
            FileResource fr = storage.store(f);
            fr.setContent(content);
            fileRepo.save(fr);
            content.getFiles().add(fr);
        }

        // Guardar quiz si corresponde
        if (req.type == ContentType.QUIZ) {
            saveQuizQuestions(content, req);
        }

        return content;
    }

    private void validateContent(CreateContentRequest req, List<MultipartFile> files) {
        if (req.title == null || req.title.isBlank() || req.title.length() > 255)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Título inválido");

        switch (req.type) {
            case SIMPLE -> {
                boolean hasMarkup = req.markup != null && !req.markup.isBlank();
                boolean hasFile = files != null && !files.isEmpty();

                if (!hasMarkup && !hasFile)
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Contenido simple requiere texto o archivo");

                if (hasFile) {
                    MultipartFile f = files.get(0);
                    String original = f.getOriginalFilename();
                    long maxSize = 250L * 1024 * 1024; // 250 MB
                    List<String> allowedExt = List.of(
                            ".txt", ".doc", ".docx", ".odt",
                            ".pdf",
                            ".jpg", ".jpeg", ".png",
                            ".mp4", ".mov", ".avi",
                            ".mp3", ".wav"
                    );

                    if (f.getSize() > maxSize)
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo supera 250 MB");

                    boolean validExt = allowedExt.stream().anyMatch(ext -> original != null && original.toLowerCase().endsWith(ext));
                    if (!validExt)
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de archivo no permitido");
                }
            }

            case FILE -> {
                if (files == null || files.isEmpty())
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo obligatorio para tipo FILE");
            }

            case EVALUATION -> {
                if (req.dueDate == null)
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fecha de vencimiento requerida");

                boolean hasFile = files != null && !files.isEmpty();
                boolean hasMarkup = req.markup != null && !req.markup.isBlank();
                if (!hasFile && !hasMarkup)
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Evaluación requiere archivo o contenido");
            }

            case QUIZ -> {
                if (req.dueDate == null)
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fecha de vencimiento requerida");
                if (req.questions == null || req.questions.isEmpty())
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz requiere al menos una pregunta");
            }
        }
    }

    private void saveQuizQuestions(Content content, CreateContentRequest req) {
        if (req.questions == null) return;

        for (QuizQuestionDto qdto : req.questions) {
            QuizQuestion q = new QuizQuestion();
            q.setQuestionText(qdto.questionText);
            q.setContent(content);
            q.setAnswers(new ArrayList<>());

            for (int i = 0; i < qdto.answers.size(); i++) {
                QuizAnswerDto adto = qdto.answers.get(i);
                QuizAnswer a = new QuizAnswer();
                a.setAnswerText(adto.answerText);
                a.setCorrect(Boolean.TRUE.equals(adto.correct) || (adto.correct == null && i == 0));
                a.setQuestion(q);
                q.getAnswers().add(a);
            }

            content.getQuestions().add(q);
        }
    }

    @Transactional(readOnly = true)
    public List<Content> listByCourse(Long courseId) {
        return contentRepo.findByCourseIdOrderByCreatedAtDesc(courseId);
    }
}

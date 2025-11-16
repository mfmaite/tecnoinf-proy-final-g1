package com.mentora.backend.service;

import com.mentora.backend.dt.DtCourse;
import com.mentora.backend.dt.DtUser;
import com.mentora.backend.dt.DtForum;
import com.mentora.backend.dt.DtEvaluation;
import com.mentora.backend.model.*;
import com.mentora.backend.repository.CourseRepository;
import com.mentora.backend.repository.ForumRepository;
import com.mentora.backend.repository.QuizRepository;
import com.mentora.backend.repository.EvaluationRepository;
import com.mentora.backend.repository.SimpleContentRepository;
import com.mentora.backend.requests.CreateCourseRequest;
import com.mentora.backend.requests.CreateEvaluationRequest;
import java.util.*;

import com.mentora.backend.requests.CreateQuizRequest;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.time.LocalDateTime;
import com.mentora.backend.dt.DtSimpleContent;
import com.mentora.backend.requests.CreateSimpleContentRequest;
import com.mentora.backend.dt.DtFileResource;
import com.mentora.backend.responses.GetCourseResponse;
import com.mentora.backend.responses.BulkCreateCoursesResponse;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.exceptions.CsvException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;



@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserCourseService userCourseService;
    private final SimpleContentRepository simpleContentRepository;
    private final FileStorageService fileStorageService;
    private final ForumRepository  forumRepository;
    private final QuizRepository quizRepository;
    private final EvaluationRepository evaluationRepository;
    private final EvaluationService evaluationService;

    public CourseService(
        CourseRepository courseRepository,
        UserCourseService userCourseService,
        SimpleContentRepository simpleContentRepository,
        FileStorageService fileStorageService,
        ForumRepository forumRepository,
        QuizRepository quizRepository,
        EvaluationRepository evaluationRepository,
        EvaluationService evaluationService
    ) {
        this.courseRepository = courseRepository;
        this.userCourseService = userCourseService;
        this.simpleContentRepository = simpleContentRepository;
        this.fileStorageService = fileStorageService;
        this.forumRepository = forumRepository;
        this.quizRepository = quizRepository;
        this.evaluationRepository = evaluationRepository;
        this.evaluationService = evaluationService;
    }

    public List<DtCourse> getCoursesForUser(String ci, Role role) {
        if (role == Role.ADMIN) {
            return courseRepository.findAll().stream()
                .map(this::getDtCourse)
                .collect(Collectors.toList());
        }

        return new ArrayList<>(userCourseService.getCoursesForUser(ci));
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
                .toList();
        List<DtEvaluation> evaluations = evaluationRepository.findByCourse_IdOrderByCreatedDateAsc(course.getId()).stream()
                .map(evaluationService::getDtEvaluation)
                .toList();

        List<Object> allContents = new ArrayList<>();
        allContents.addAll(contents);
        allContents.addAll(evaluations);
        allContents.sort(Comparator.comparing(o -> {
            if (o instanceof DtSimpleContent) {
                return ((DtSimpleContent) o).getCreatedDate();
            } else if (o instanceof DtEvaluation) {
                return ((DtEvaluation) o).getCreatedDate();
            }
            return LocalDateTime.MIN;
        }));

        List<Forum> forums = forumRepository.findByCourse_Id(course.getId());

        List<DtForum> dtForums = forums.stream()
                .map(forum -> new DtForum(forum.getId().toString(), forum.getType().name(), course.getId()))
                .collect(Collectors.toList());

        return new GetCourseResponse(getDtCourse(course), allContents, dtForums);
    }

    public Object getContentByTypeAndId(String courseId, String type, Long contentId, String userCi) {
        if (type == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de contenido obligatorio");
        }
        switch (type) {
            case "simpleContent": {
                SimpleContent sc = simpleContentRepository.findByIdAndCourse_Id(contentId, courseId);
                if (sc == null) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Contenido no encontrado");
                }
                return getDtSimpleContent(sc);
            }
            case "evaluation": {
                Evaluation e = evaluationRepository.findByIdAndCourse_Id(contentId, courseId);
                if (e == null) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Contenido no encontrado");
                }
                // Retornar evaluación con submissions según el rol del usuario (profesor: todas; estudiante: solo la suya)
                return evaluationService.getEvaluation(e.getId(), userCi);
            }
            case "quiz": {
                // No implementado aún
                throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "Quiz no implementado");
            }
            default:
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de contenido inválido");
        }
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

    public Quiz createQuiz(String courseId, CreateQuizRequest req, String userCi) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        boolean isProfessor = userCourseService
                .getParticipantsFromCourse(course.getId()).stream()
                .anyMatch(u -> u.getCi().equals(userCi) && u.getRole() == Role.PROFESOR);

        if (!isProfessor)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tiene permisos");

        if (req.getQuestions() == null || req.getQuestions().isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe haber al menos una pregunta");

        for (CreateQuizRequest.QuestionDTO q : req.getQuestions()) {
            if (q.getAnswers() == null || q.getAnswers().size() < 2)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cada pregunta debe tener al menos dos respuestas");

            boolean hasCorrect = q.getAnswers()
                    .stream()
                    .anyMatch(CreateQuizRequest.AnswerDTO::isCorrect);

            if (!hasCorrect)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cada pregunta debe tener una respuesta correcta");
        }

        Quiz quiz = new Quiz();
        quiz.setTitle(req.getTitle());
        quiz.setCourse(course);
        quiz.setExpirationDate(req.getDueDate());

        return getQuiz(req, quiz);
    }

    public Quiz editQuiz(String courseId, Long quizId, CreateQuizRequest req, String userCi) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz no encontrado"));

        if (!quiz.getCourse().getId().equals(courseId))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz no encontrado en ese curso");

        boolean isProfessor = userCourseService
                .getParticipantsFromCourse(quiz.getCourse().getId()).stream()
                .anyMatch(u -> u.getCi().equals(userCi) && u.getRole() == Role.PROFESOR);

        if (!isProfessor)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tiene permisos");

        if (req.getQuestions() == null || req.getQuestions().isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe haber al menos una pregunta");

        for (CreateQuizRequest.QuestionDTO q : req.getQuestions()) {
            if (q.getAnswers() == null || q.getAnswers().size() < 2)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cada pregunta debe tener al menos dos respuestas");

            boolean hasCorrect = q.getAnswers()
                    .stream()
                    .anyMatch(CreateQuizRequest.AnswerDTO::isCorrect);

            if (!hasCorrect)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cada pregunta debe tener una respuesta correcta");
        }

        quiz.setTitle(req.getTitle());
        quiz.setExpirationDate(req.getDueDate());

        // remove existing questions/answers (orphanRemoval + cascade se encargan)
        quiz.getQuestions().clear();

        return getQuiz(req, quiz);
    }

    private Quiz getQuiz(CreateQuizRequest req, Quiz quiz) {
        List<QuizQuestion> questions = req.getQuestions().stream().map(q -> {
            QuizQuestion qq = new QuizQuestion();
            qq.setQuestionText(q.getQuestion());
            qq.setQuiz(quiz);

            List<QuizAnswer> answers = q.getAnswers().stream().map(a -> {
                QuizAnswer qa = new QuizAnswer();
                qa.setAnswerText(a.getText());
                qa.setCorrect(a.isCorrect());
                qa.setQuestion(qq);
                return qa;
            }).toList();

            qq.setAnswers(answers);
            return qq;
        }).toList();

        quiz.setQuestions(questions);

        return quizRepository.save(quiz);
    }

    public void deleteQuiz(String courseId, Long quizId, String userCi) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz no encontrado"));

        if (!quiz.getCourse().getId().equals(courseId))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz no encontrado en ese curso");

        boolean isProfessor = userCourseService
                .getParticipantsFromCourse(quiz.getCourse().getId()).stream()
                .anyMatch(u -> u.getCi().equals(userCi) && u.getRole() == Role.PROFESOR);

        if (!isProfessor)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tiene permisos");

        quizRepository.delete(quiz);
    }

    private DtCourse getDtCourse(Course c) {
        return new DtCourse(c.getId(), c.getName(), c.getCreatedDate());
    }

    private DtSimpleContent getDtSimpleContent(SimpleContent sc) {
        String signedUrl = null;
        String fileUrl = sc.getFileUrl();
        if (fileUrl != null) {
            if (fileUrl.startsWith("gs://")) {
                signedUrl = fileStorageService.generateSignedUrl(fileUrl);
            } else {
                signedUrl = fileUrl;
            }
        }

        return new DtSimpleContent(
            sc.getId(),
            sc.getTitle(),
            sc.getContent(),
            sc.getFileName(),
            signedUrl,
            sc.getCreatedDate()
        );
    }

    public String addParticipants(String courseId, String[] participantIds) {
        return userCourseService.addUsersToCourse(courseId, participantIds);
    }

    public String deleteParticipants(String courseId, String[] participantIds) {
        return userCourseService.deleteUsersFromCourse(courseId, participantIds);
    }

    public List<DtUser> getParticipants(String courseId) {
        return userCourseService.getParticipantsFromCourse(courseId);
    }

    public List<DtUser> getNonParticipants(String courseId) {
        return userCourseService.getNonParticipantsFromCourse(courseId);
    }

    public BulkCreateCoursesResponse createCoursesFromCsv(InputStream csvInputStream) throws IOException, CsvException {
        if (csvInputStream == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo CSV requerido");
        }

        List<DtCourse> createdCourses = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        try (CSVReader reader = new CSVReaderBuilder(new InputStreamReader(csvInputStream, StandardCharsets.UTF_8)).build()) {
            List<String[]> rows = reader.readAll();
            if (rows == null || rows.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo CSV vacío");
            }

            int lineNumber = 0;
            for (String[] row : rows) {
                lineNumber++;

                if (row == null) { continue; }
                if (lineNumber == 1 && row.length > 0 && row[0] != null && row[0].trim().equalsIgnoreCase("identificador del curso")) {
                    continue;
                }

                String id = row.length > 0 && row[0] != null ? row[0].trim() : "";
                String name = row.length > 1 && row[1] != null ? row[1].trim() : "";
                String professorsCell = row.length > 2 && row[2] != null ? row[2].trim() : "";

                if (id.isEmpty() && name.isEmpty() && professorsCell.isEmpty()) {
                    continue;
                }

                id = id.toUpperCase();

                if (id.isEmpty()) {
                    errors.add("Fila " + lineNumber + ": ID del curso obligatorio");
                    continue;
                }
                if (!id.matches("^[A-Z0-9]{1,10}$")) {
                    errors.add("Fila " + lineNumber + ": ID inválido (máximo 10 caracteres, solo mayúsculas y números)");
                    continue;
                }
                if (name.isEmpty()) {
                    errors.add("Fila " + lineNumber + " (" + id + "): Nombre obligatorio");
                    continue;
                }
                if (professorsCell.isEmpty()) {
                    errors.add("Fila " + lineNumber + " (" + id + "): Profesores asignados obligatorios");
                    continue;
                }

                String[] cis = java.util.Arrays.stream(professorsCell.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .distinct()
                        .toArray(String[]::new);

                if (cis.length == 0) {
                    errors.add("Fila " + lineNumber + " (" + id + "): Se requiere al menos un CI de profesor");
                    continue;
                }
                boolean cisValid = java.util.Arrays.stream(cis).allMatch(ci -> ci.matches("^\\d+$"));
                if (!cisValid) {
                    errors.add("Fila " + lineNumber + " (" + id + "): CIs de profesores inválidos (solo dígitos)");
                    continue;
                }

                CreateCourseRequest req = new CreateCourseRequest();
                req.setId(id);
                req.setName(name);
                req.setProfessorsCis(cis);

                try {
                    DtCourse created = createCourse(req);
                    createdCourses.add(created);
                } catch (ResponseStatusException e) {
                    errors.add("Fila " + lineNumber + " (" + id + "): " + e.getReason());
                } catch (Exception e) {
                    errors.add("Fila " + lineNumber + " (" + id + "): Error inesperado al crear el curso");
                }
            }
        }

        return new BulkCreateCoursesResponse(createdCourses, errors);
    }

    public DtEvaluation createEvaluation(String courseId, CreateEvaluationRequest req) throws IOException {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));

        if (req.getFile() == null && req.getContent() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Evaluación requiere texto o archivo");
        }

        if (req.getDueDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha límite de entrega de la evaluación es obligatoria");
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

        Evaluation newEvaluation = new Evaluation(req.getTitle(), course, fileName, fileUrl, content, req.getDueDate());
        Evaluation saved = evaluationRepository.save(newEvaluation);

        return evaluationService.getDtEvaluation(saved);
    }

    public DtSimpleContent updateSimpleContent(Long contentId, CreateSimpleContentRequest req) throws IOException {
        SimpleContent sc = simpleContentRepository.findById(contentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contenido no encontrado"));

        if (req.getTitle() != null) sc.setTitle(req.getTitle());
        if (req.getContent() != null) sc.setContent(req.getContent());
        if (req.getFile() != null) {
            DtFileResource file = fileStorageService.store(req.getFile());
            sc.setFileName(file.getFilename());
            sc.setFileUrl(file.getStoragePath());
        }

        SimpleContent saved = simpleContentRepository.save(sc);
        return getDtSimpleContent(saved);
    }

}

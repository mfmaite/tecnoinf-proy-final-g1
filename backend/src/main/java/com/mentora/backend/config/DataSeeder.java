package com.mentora.backend.config;

import com.mentora.backend.model.*;
import com.mentora.backend.repository.*;
import com.mentora.backend.service.FileStorageService;
import com.mentora.backend.dt.DtFileResource;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CourseRepository courseRepository;
    private final UserCourseRepository userCourseRepository;
    private final SimpleContentRepository simpleContentRepository;
    private final EvaluationRepository evaluationRepository;
    private final QuizRepository quizRepository;
    private final ForumRepository forumRepository;
    private final PostRepository postRepository;
    private final FileStorageService fileStorageService;

    public DataSeeder(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        UserCourseRepository userCourseRepository,
        CourseRepository courseRepository,
        SimpleContentRepository simpleContentRepository,
        EvaluationRepository evaluationRepository,
        QuizRepository quizRepository,
        ForumRepository forumRepository,
        PostRepository postRepository,
        FileStorageService fileStorageService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userCourseRepository = userCourseRepository;
        this.courseRepository = courseRepository;
        this.simpleContentRepository = simpleContentRepository;
        this.evaluationRepository = evaluationRepository;
        this.quizRepository = quizRepository;
        this.forumRepository = forumRepository;
        this.postRepository = postRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedCoursesAndContentsAndForums();
    }

    private void seedUsers() {
        List<Path> avatars = listFiles(Paths.get("src/main/resources/seed-files/profile-picture"));
        System.out.println("Avatars encontrados: " + avatars.size());
        Path adminAvatar = avatars.size() > 0 ? avatars.get(0) : null;
        Path profAvatar = avatars.size() > 1 ? avatars.get(1) : null;
        Path studAvatar = avatars.size() > 2 ? avatars.get(2) : null;

        // Usuario Admin
        if (userRepository.findByEmail("admin@mentora.com").isEmpty()) {
            String pictureUrl = null;
            String pictureFileName = null;
            try {
                if (adminAvatar != null) {
                    DtFileResource fr = fileStorageService.store(adminAvatar);
                    pictureUrl = fr.getStoragePath();
                    pictureFileName = fr.getFilename();
                }
            } catch (Exception e) {
                System.out.println("Error al almacenar el avatar del administrador: " + e.getMessage());
            }

            User admin = new User(
                "11111111",
                "Administrador",
                "admin@mentora.com",
                passwordEncoder.encode("Admin123"),
                "Usuario administrador del sistema",
                pictureUrl,
                pictureFileName,
                Role.ADMIN
            );
            userRepository.save(admin);
        }

        // Usuario Profesor
        if (userRepository.findByEmail("profesor@mentora.com").isEmpty()) {
            String pictureUrl = null;
            String pictureFileName = null;
            try {
                if (profAvatar != null) {
                    DtFileResource fr = fileStorageService.store(profAvatar);
                    pictureUrl = fr.getStoragePath();
                    pictureFileName = fr.getFilename();
                }
            } catch (Exception ignored) {}
            User profesor = new User(
                "22222222",
                "Juan Pérez",
                "profesor@mentora.com",
                passwordEncoder.encode("Profesor123"),
                "Profesor de matemáticas con 10 años de experiencia",
                pictureUrl,
                pictureFileName,
                Role.PROFESOR
            );
            userRepository.save(profesor);
        }

        // Usuario Estudiante
        if (userRepository.findByEmail("estudiante@mentora.com").isEmpty()) {
            String pictureUrl = null;
            String pictureFileName = null;
            try {
                if (studAvatar != null) {
                    DtFileResource fr = fileStorageService.store(studAvatar);
                    pictureUrl = fr.getStoragePath();
                    pictureFileName = fr.getFilename();
                }
            } catch (Exception ignored) {}
            User estudiante = new User(
                "33333333",
                "María González",
                "estudiante@mentora.com",
                passwordEncoder.encode("Estudiante123"),
                "Estudiante de segundo año",
                pictureUrl,
                pictureFileName,
                Role.ESTUDIANTE
            );
            userRepository.save(estudiante);
        }

        System.out.println("=== Seed de usuarios completado ===");
    }

    private List<Path> listFiles(Path dir) {
        try {
            if (!Files.exists(dir) || !Files.isDirectory(dir)) return List.of();
            List<Path> files = new ArrayList<>();
            try (var s = Files.list(dir)) {
                s.filter(Files::isRegularFile).forEach(files::add);
            }
            Collections.sort(files);
            return files;
        } catch (Exception e) {
            return List.of();
        }
    }

    private static String stem(Path p) {
        String name = p.getFileName().toString();
        int dot = name.lastIndexOf('.');
        return dot > 0 ? name.substring(0, dot) : name;
    }

    private Optional<Path> findCourseFile(Path dir, String courseId) {
        return listFiles(dir).stream().filter(p -> stem(p).equalsIgnoreCase(courseId)).findFirst();
    }

    private Course ensureCourse(String id, String name, LocalDateTime createdDate) {
        Optional<Course> existing = courseRepository.findById(id);
        if (existing.isPresent()) {
            return existing.get();
        }
        Course c = new Course(id, name, createdDate);
        return courseRepository.save(c);
    }

    private Forum ensureForum(Course course, ForumType type) {
        return forumRepository.findByCourse_IdAndType(course.getId(), type)
                .orElseGet(() -> forumRepository.save(new Forum(type, course)));
    }

    private void seedCoursesAndContentsAndForums() {
        User admin = userRepository.findByEmail("admin@mentora.com").orElse(null);
        User profesor = userRepository.findByEmail("profesor@mentora.com").orElse(null);
        User estudiante = userRepository.findByEmail("estudiante@mentora.com").orElse(null);

        LocalDateTime now = LocalDateTime.now();
        Course c1 = ensureCourse("MAT2026", "Matemáticas 2026", now.minusDays(20));
        Course c2 = ensureCourse("PROG1", "Programación I", now.minusDays(8));
        Course c3 = ensureCourse("BCYT", "Biología Celular y Tisular", now.minusDays(4));

        List<Course> courses = List.of(c1, c2, c3);

        // Enroll users (idempotent)
        for (Course c : courses) {
            if (admin != null && userCourseRepository.findByCourseAndUser(c, admin).isEmpty()) {
                userCourseRepository.save(new UserCourse(c, admin, null));
            }
            if (profesor != null && userCourseRepository.findByCourseAndUser(c, profesor).isEmpty()) {
                userCourseRepository.save(new UserCourse(c, profesor, null));
            }
            if (estudiante != null && userCourseRepository.findByCourseAndUser(c, estudiante).isEmpty()) {
                userCourseRepository.save(new UserCourse(c, estudiante, null));
            }
        }

        Path simpleFilesDir = Paths.get("src/main/resources/seed-files/simple-content");
        Path evaluationFilesDir = Paths.get("src/main/resources/seed-files/evaluations");

        for (Course c : courses) {
            String titleFileSC = "Material de apoyo";
            boolean existsFileSC = simpleContentRepository.findByCourse_IdOrderByCreatedDateAsc(c.getId())
                    .stream().anyMatch(sc -> titleFileSC.equals(sc.getTitle()));
            if (!existsFileSC) {
                SimpleContent sc = new SimpleContent(
                        titleFileSC,
                        c,
                        null,
                        null,
                        "Material complementario del curso " + c.getName()
                );
                sc.setCreatedDate(c.getCreatedDate().plusDays(1));
                findCourseFile(simpleFilesDir, c.getId()).ifPresent(p -> {
                    try {
                        DtFileResource fr = fileStorageService.store(p);
                        sc.setFileName(fr.getFilename());
                        sc.setFileUrl(fr.getStoragePath());
                    } catch (Exception ignored) {}
                });
                simpleContentRepository.save(sc);
            }

            String titleTextSC = "Guía de estudio";
            boolean existsTextSC = simpleContentRepository.findByCourse_IdOrderByCreatedDateAsc(c.getId())
                    .stream().anyMatch(sc -> titleTextSC.equals(sc.getTitle()));
            if (!existsTextSC) {
                String content = generateSimpleContentMarkdown(c.getId(), c.getName());
                SimpleContent sc2 = new SimpleContent(
                        titleTextSC,
                        c,
                        null,
                        null,
                        content
                );
                sc2.setCreatedDate(c.getCreatedDate().plusDays(2));
                simpleContentRepository.save(sc2);
            }

            // Evaluation from file (1)
            String titleFileEV = "Evaluación práctica";
            boolean existsFileEV = evaluationRepository.findByCourse_IdOrderByCreatedDateAsc(c.getId())
                    .stream().anyMatch(ev -> titleFileEV.equals(ev.getTitle()));
            if (!existsFileEV) {
                LocalDateTime created = c.getCreatedDate().plusDays(3);
                LocalDateTime due = now.plusDays(7);
                Evaluation ev = new Evaluation(
                        titleFileEV,
                        c,
                        null,
                        null,
                        "Lea cuidadosamente el material adjunto y resuelva los ejercicios indicados.",
                        due
                );
                ev.setCreatedDate(created);
                findCourseFile(evaluationFilesDir, c.getId()).ifPresent(p -> {
                    try {
                        DtFileResource fr = fileStorageService.store(p);
                        ev.setFileName(fr.getFilename());
                        ev.setFileUrl(fr.getStoragePath());
                    } catch (Exception ignored) {}
                });
                evaluationRepository.save(ev);
            }

            // Evaluation text-only with markdown (1)
            String titleTextEV = "Trabajo de reflexión - " + c.getName();
            boolean existsTextEV = evaluationRepository.findByCourse_IdOrderByCreatedDateAsc(c.getId())
                    .stream().anyMatch(ev -> titleTextEV.equals(ev.getTitle()));
            if (!existsTextEV) {
                LocalDateTime created = c.getCreatedDate().plusDays(4);
                LocalDateTime due = now.minusDays(2);
                String content = generateEvaluationMarkdown(c.getId(), c.getName());
                Evaluation ev2 = new Evaluation(
                        titleTextEV,
                        c,
                        null,
                        null,
                        content,
                        due
                );
                ev2.setCreatedDate(created);
                evaluationRepository.save(ev2);
            }

            // Quiz x1 (idempotent by title)
            String quizTitle = "Quiz inicial - " + c.getName();
            boolean existsQuiz = quizRepository.findByCourse_IdOrderByCreatedDateAsc(c.getId())
                    .stream().anyMatch(q -> quizTitle.equals(q.getTitle()));
            if (!existsQuiz) {
                LocalDateTime created = c.getCreatedDate().plusDays(5);
                LocalDateTime due = now.plusDays(10);
                Quiz quiz = new Quiz();
                quiz.setTitle(quizTitle);
                quiz.setCourse(c);
                quiz.setCreatedDate(created);
                quiz.setDueDate(due);

                List<QuizQuestion> questions = generateQuizQuestions(c.getId(), quiz);
                quiz.setQuestions(questions);
                quizRepository.save(quiz);
            }

            // Forums and posts (idempotent by message)
            Forum fAnn = ensureForum(c, ForumType.ANNOUNCEMENTS);
            Forum fCons = ensureForum(c, ForumType.CONSULTS);

            // Anuncios: solo profesor
            User[] annAuthors = new User[] { profesor };
            String[] baseMsgs = new String[] {
                "Bienvenidos a " + c.getName(),
                "Recordatorio importante",
                "Consulta sobre contenidos",
                "Aviso de cambios",
                "Dudas frecuentes"
            };
            for (int i = 0; i < 5; i++) {
                String msg = baseMsgs[i % baseMsgs.length];
                boolean existsAnn = postRepository.findByForum_IdOrderByCreatedDateDesc(fAnn.getId())
                        .stream().anyMatch(p -> msg.equals(p.getMessage()));
                if (!existsAnn) {
                    User author = annAuthors[i % annAuthors.length];
                    if (author != null) {
                        postRepository.save(new Post(fAnn, author, msg));
                    }
                }
            }
            // Consultas: profesor y estudiante (nunca admin)
            User[] consAuthors = new User[] { profesor, estudiante };
            for (int i = 0; i < 5; i++) {
                String msg = baseMsgs[(i + 1) % baseMsgs.length];
                boolean existsCons = postRepository.findByForum_IdOrderByCreatedDateDesc(fCons.getId())
                        .stream().anyMatch(p -> msg.equals(p.getMessage()));
                if (!existsCons) {
                    User author = consAuthors[(i + 1) % consAuthors.length];
                    if (author != null) {
                        postRepository.save(new Post(fCons, author, msg));
                    }
                }
            }
        }

        System.out.println("=== Seed de cursos, contenidos y foros completado ===");
    }

    private String generateSimpleContentMarkdown(String courseId, String courseName) {
        switch (courseId.toUpperCase()) {
            case "MAT2026":
                return "# Repaso de Álgebra Lineal\n\n" +
                       "**Objetivos:**\n" +
                       "- Comprender vectores y matrices\n" +
                       "- Aplicar operaciones básicas\n\n" +
                       "## Ejemplo\n" +
                       "Si A es una matriz 2x2, su determinante es:\n\n" +
                       "```\n" +
                       "det(A) = a·d - b·c\n" +
                       "```\n";
            case "PROG1":
                return "# Introducción a funciones en C\n\n" +
                       "Una función se declara con su tipo de retorno y parámetros.\n\n" +
                       "```c\n" +
                       "int suma(int a, int b) {\n" +
                       "  return a + b;\n" +
                       "}\n" +
                       "```\n" +
                       "_Tip: compilar con `-Wall` para ver advertencias._\n";
            case "BCYT":
                return "# Organización celular\n\n" +
                       "Las **células** presentan compartimentos como *núcleo*, *mitocondrias* y *retículo endoplásmico*.\n\n" +
                       "## Lectura sugerida\n" +
                       "- Membrana plasmática y transporte\n" +
                       "- Señalización celular\n";
            default:
                return "# Contenido de apoyo\n\n" +
                       "Material introductorio para " + courseName + ".\n";
        }
    }

    private String generateEvaluationMarkdown(String courseId, String courseName) {
        switch (courseId.toUpperCase()) {
            case "MAT2026":
                return "## Problemas de práctica\n\n" +
                       "1. Resuelva el sistema por eliminación Gaussiana.\n" +
                       "2. Calcule autovalores de la matriz propuesta.\n";
            case "PROG1":
                return "## Tarea: manejo de cadenas\n\n" +
                       "- Implementar una función `reverse(char*)`\n" +
                       "- Escribir pruebas unitarias.\n";
            case "BCYT":
                return "## Ensayo breve\n\n" +
                       "Explique en 200 palabras la función de las mitocondrias y su rol en la **apoptosis**.\n";
            default:
                return "## Actividad\n\n" +
                       "Responda a las preguntas orientadoras sobre " + courseName + ".\n";
        }
    }

    private List<QuizQuestion> generateQuizQuestions(String courseId, Quiz quiz) {
        List<QuizQuestion> questions = new ArrayList<>();
        if ("MAT2026".equalsIgnoreCase(courseId)) {
            QuizQuestion q1 = new QuizQuestion();
            q1.setQuestionText("¿Cuál es el determinante de una matriz 2x2 [[a,b],[c,d]]?");
            q1.setQuiz(quiz);
            List<QuizAnswer> a1 = new ArrayList<>();
            a1.add(answer("a·d - b·c", true, q1));
            a1.add(answer("a + b + c + d", false, q1));
            a1.add(answer("a·b + c·d", false, q1));
            q1.setAnswers(a1);
            questions.add(q1);
        } else if ("PROG1".equalsIgnoreCase(courseId)) {
            QuizQuestion q1 = new QuizQuestion();
            q1.setQuestionText("¿Qué imprime el siguiente programa en C? int x=2; printf(\"%d\", x+1);");
            q1.setQuiz(quiz);
            List<QuizAnswer> a1 = new ArrayList<>();
            a1.add(answer("3", true, q1));
            a1.add(answer("2", false, q1));
            a1.add(answer("Error de compilación", false, q1));
            q1.setAnswers(a1);
            questions.add(q1);
        } else if ("BCYT".equalsIgnoreCase(courseId)) {
            QuizQuestion q1 = new QuizQuestion();
            q1.setQuestionText("La función principal de las mitocondrias es:");
            q1.setQuiz(quiz);
            List<QuizAnswer> a1 = new ArrayList<>();
            a1.add(answer("Producción de ATP", true, q1));
            a1.add(answer("Síntesis de proteínas ribosomales", false, q1));
            a1.add(answer("Replicación del ADN nuclear", false, q1));
            q1.setAnswers(a1);
            questions.add(q1);
        } else {
            QuizQuestion q1 = new QuizQuestion();
            q1.setQuestionText("Pregunta general de diagnóstico.");
            q1.setQuiz(quiz);
            List<QuizAnswer> a1 = new ArrayList<>();
            a1.add(answer("Opción correcta", true, q1));
            a1.add(answer("Opción incorrecta", false, q1));
            q1.setAnswers(a1);
            questions.add(q1);
        }
        return questions;
    }

    private QuizAnswer answer(String text, boolean correct, QuizQuestion q) {
        QuizAnswer a = new QuizAnswer();
        a.setAnswerText(text);
        a.setCorrect(correct);
        a.setQuestion(q);
        return a;
    }
}


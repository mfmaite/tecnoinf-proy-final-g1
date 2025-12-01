package com.mentora.backend.service;

import com.mentora.backend.repository.EvaluationRepository;
import com.mentora.backend.dt.DtFileResource;
import com.mentora.backend.dt.DtEvaluation;
import com.mentora.backend.dt.DtEvaluationSubmission;
import com.mentora.backend.model.Activity;
import com.mentora.backend.model.ActivityType;
import com.mentora.backend.model.Evaluation;
import com.mentora.backend.model.EvaluationSubmission;
import com.mentora.backend.model.User;
import com.mentora.backend.model.Role;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.mentora.backend.requests.CreateEvaluationSubmissionRequest;
import com.mentora.backend.requests.EditEvaluationRequest;
import com.mentora.backend.repository.UserRepository;
import com.mentora.backend.repository.EvaluationSubmissionRepository;
import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.mentora.backend.responses.GetEvaluationWithSubmissionResponse;
import java.time.LocalDateTime;
import com.mentora.backend.repository.ActivityRepository;

@Service
public class EvaluationService {
  private final EvaluationRepository evaluationRepository;
  private final FileStorageService fileStorageService;
  private final UserService userService;
  private final UserRepository userRepository;
  private final EvaluationSubmissionRepository evaluationSubmissionRepository;
  private final ActivityRepository activityRepository;

  public EvaluationService(
      EvaluationRepository evaluationRepository,
      FileStorageService fileStorageService,
      UserService userService,
      UserRepository userRepository,
      EvaluationSubmissionRepository evaluationSubmissionRepository,
      ActivityRepository activityRepository
    ) {
    this.evaluationRepository = evaluationRepository;
    this.fileStorageService = fileStorageService;
    this.userService = userService;
    this.userRepository = userRepository;
    this.evaluationSubmissionRepository = evaluationSubmissionRepository;
    this.activityRepository = activityRepository;
  }

  public GetEvaluationWithSubmissionResponse getEvaluation(Long evaluationId, String userCi) {
    User user = userRepository.findById(userCi)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

    Evaluation evaluation = evaluationRepository.findById(evaluationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evaluación no encontrada"));

    List<EvaluationSubmission> submissions = new ArrayList<>();

    if (user.getRole().equals(Role.PROFESOR)) {
      submissions = evaluationSubmissionRepository.findByEvaluationId(evaluationId);
    } else {
      submissions = evaluationSubmissionRepository.findByEvaluationIdAndAuthorCi(evaluationId, userCi);
    }

    List<DtEvaluationSubmission> dtSubmissions = submissions.stream()
      .map(this::getDtEvaluationSubmission)
      .collect(Collectors.toList());

    return new GetEvaluationWithSubmissionResponse(
      getDtEvaluation(evaluation),
      dtSubmissions
    );
  }

  public DtEvaluation getDtEvaluation(Evaluation e) {
    String signedUrl = null;
    String fileUrl = e.getFileUrl();
    if (fileUrl != null) {
        if (fileUrl.startsWith("gs://")) {
            signedUrl = fileStorageService.generateSignedUrl(fileUrl);
        } else {
            signedUrl = fileUrl;
        }
    }

    return new DtEvaluation(
        e.getId(),
        e.getTitle(),
        e.getContent(),
        e.getFileName(),
        signedUrl,
        e.getCreatedDate(),
        e.getDueDate()
    );
  }

  public DtEvaluationSubmission getDtEvaluationSubmission(EvaluationSubmission e) {
    String signedUrl = null;
    String fileUrl = e.getFileUrl();
    if (fileUrl != null) {
        if (fileUrl.startsWith("gs://")) {
            signedUrl = fileStorageService.generateSignedUrl(fileUrl);
        } else {
            signedUrl = fileUrl;
        }
    }

    return new DtEvaluationSubmission(
        e.getId(),
        e.getFileName(),
        signedUrl,
        e.getNote(),
        userService.getUserDto(e.getAuthor()),
        getDtEvaluation(e.getEvaluation()),
        e.getSolution()
    );
  }

  public DtEvaluationSubmission createEvaluationSubmission(Long evaluationId, String userCi, CreateEvaluationSubmissionRequest req) throws IOException {
    if (req.getFile() == null && req.getSolution() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Respuesta a evaluación requiere texto o archivo");
    }

    List<EvaluationSubmission> existingSubmission = evaluationSubmissionRepository.findByEvaluationIdAndAuthorCi(evaluationId, userCi);
    if (existingSubmission.size() > 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe una respuesta para esta evaluación, intenta editarla");
    }

    Evaluation evaluation = evaluationRepository.findById(evaluationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evaluación no encontrada"));

    User user = userRepository.findById(userCi)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

    LocalDateTime dueDate = evaluation.getDueDate();
    if (dueDate != null && dueDate.isBefore(LocalDateTime.now())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha límite de entrega de la evaluación ha expirado, no es posible enviar una respuesta");
    }

    String fileName = null;
    String fileUrl = null;

    if (req.getFile() != null) {
      DtFileResource file = fileStorageService.store(req.getFile());
      fileName = file.getFilename();
      fileUrl = file.getStoragePath();
    }

    EvaluationSubmission submission = new EvaluationSubmission(
      req.getSolution(),
      fileName,
      fileUrl,
      null,
      evaluation,
      user
    );

    EvaluationSubmission saved = evaluationSubmissionRepository.save(submission);

    // Crea la actividad de participación en la evaluación
    Activity activity = new Activity(
      ActivityType.ACTIVITY_SENT,
      "Participación en la evaluación de " + evaluation.getTitle(),
      "/courses/" + evaluation.getCourse().getId() + "/contents/evaluation/" + evaluation.getId(),
      user
    );
    activityRepository.save(activity);

    return getDtEvaluationSubmission(saved);
  }

  public DtEvaluation updateEvaluation(Long evaluationId, EditEvaluationRequest req) throws IOException {
      Evaluation ev = evaluationRepository.findById(evaluationId)
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evaluación no encontrada"));

      if (req.getTitle() != null) ev.setTitle(req.getTitle());
      if (req.getContent() != null) ev.setContent(req.getContent());
      if (req.getDueDate() != null) ev.setDueDate(req.getDueDate());

      if (Boolean.TRUE.equals(req.getClearFile())) {
        ev.setFileName(null);
        ev.setFileUrl(null);
    }

      if (req.getFile() != null) {
        DtFileResource file = fileStorageService.store(req.getFile());
        ev.setFileName(file.getFilename());
        ev.setFileUrl(file.getStoragePath());
      }

      Evaluation saved = evaluationRepository.save(ev);

      return getDtEvaluation(saved);
  }

  public DtEvaluationSubmission gradeEvaluation(Long evaluationId, String studentCi, Integer grade) {
    if (grade < 1 || grade > 12) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La nota debe estar entre 1 y 12");
    }

    List<EvaluationSubmission> submissions = evaluationSubmissionRepository.findByEvaluationIdAndAuthorCi(evaluationId, studentCi);

    if (submissions.size() == 0) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudiante no ha participado en la evaluación");
    }

    EvaluationSubmission submission = submissions.get(0);

    if (submission.getNote() != null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La respuesta ya ha sido calificada");
    }

    submission.setNote(grade);
    EvaluationSubmission saved = evaluationSubmissionRepository.save(submission);
    return getDtEvaluationSubmission(saved);
  }
}

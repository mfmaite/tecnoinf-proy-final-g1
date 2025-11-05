package com.mentora.backend.service;

import com.mentora.backend.repository.EvaluationRepository;
import com.mentora.backend.dt.DtEvaluation;
import com.mentora.backend.model.Evaluation;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class EvaluationService {
  private final EvaluationRepository evaluationRepository;
  private final FileStorageService fileStorageService;

  public EvaluationService(
      EvaluationRepository evaluationRepository,
      FileStorageService fileStorageService
    ) {
    this.evaluationRepository = evaluationRepository;
    this.fileStorageService = fileStorageService;
  }

  public DtEvaluation getEvaluation(String evaluationId) {
    Evaluation evaluation = evaluationRepository.findById(evaluationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evaluación no encontrada"));
    return getDtEvaluation(evaluation);
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

    return  new DtEvaluation(
        e.getId(),
        e.getTitle(),
        e.getContent(),
        e.getFileName(),
        signedUrl,
        e.getCreatedDate()
    );
}
}

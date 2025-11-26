package com.mentora.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.mentora.backend.model.Quiz;
import com.mentora.backend.model.QuizQuestion;
import com.mentora.backend.model.QuizAnswer;
import com.mentora.backend.model.QuizSubmission;
import com.mentora.backend.model.User;
import com.mentora.backend.repository.QuizRepository;
import com.mentora.backend.repository.QuizSubmissionRepository;
import com.mentora.backend.repository.UserRepository;
import com.mentora.backend.requests.UpdateQuizRequest;
import com.mentora.backend.requests.CreateQuizSubmissionRequest;
import com.mentora.backend.dt.DtQuiz;
import com.mentora.backend.dt.DtQuizSubmission;
import com.mentora.backend.responses.GetQuizResponse;
import com.mentora.backend.responses.QuizQuestionResponse;
import com.mentora.backend.responses.QuizAnswerResponse;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Objects;
import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
public class QuizService {

  private final QuizRepository quizRepository;
  private final QuizSubmissionRepository quizSubmissionRepository;
  private final UserRepository userRepository;
  private final UserService userService;

  public QuizService(
      QuizRepository quizRepository,
      QuizSubmissionRepository quizSubmissionRepository,
      UserRepository userRepository,
      UserService userService
  ) {
      this.quizRepository = quizRepository;
      this.quizSubmissionRepository = quizSubmissionRepository;
      this.userRepository = userRepository;
      this.userService = userService;
  }

  public GetQuizResponse getQuiz(Quiz quiz) {
    DtQuiz dtQuiz = getDtQuiz(quiz);

    List<QuizQuestionResponse> questions = quiz.getQuestions().stream().map(q -> {
      List<QuizAnswerResponse> answers = q.getAnswers().stream()
        .map(a -> new QuizAnswerResponse(
          a.getId(),
          a.getAnswerText(),
          a.getCorrect()
        ))
        .collect(Collectors.toList());
      return new QuizQuestionResponse(
        q.getId(),
        q.getQuestionText(),
        answers
      );
    }).collect(Collectors.toList());

    return new GetQuizResponse(dtQuiz, questions);
  }

  public DtQuiz editQuiz(Long quizId, UpdateQuizRequest req) {
    Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz no encontrado"));

    if (req.getTitle() != null) {
      quiz.setTitle(req.getTitle());
    }

    if (req.getDueDate() != null) {
      quiz.setDueDate(req.getDueDate());
    }

    // Si hay preguntas que se quieren eliminar, se eliminan
    if (req.getRemoveQuestionIds() != null && !req.getRemoveQuestionIds().isEmpty()) {
      Iterator<QuizQuestion> it = quiz.getQuestions().iterator();
      while (it.hasNext()) {
        QuizQuestion existing = it.next();
        if (req.getRemoveQuestionIds().contains(existing.getId())) {
          it.remove();
        }
      }
    }

    if (req.getQuestions() != null && !req.getQuestions().isEmpty()) {
      Map<Long, QuizQuestion> existingQuestionsById = new HashMap<>();
      // Se mapean las preguntas que ya existen
      for (QuizQuestion q : quiz.getQuestions()) {
        if (q.getId() != null) {
          existingQuestionsById.put(q.getId(), q);
        }
      }

      for (UpdateQuizRequest.QuestionUpdateDTO qReq : req.getQuestions()) {
        if (qReq.getId() != null) {
          QuizQuestion existing = existingQuestionsById.get(qReq.getId());
          // Si la pregunta no existe, se lanza un error
          if (existing == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pregunta no encontrada: " + qReq.getId());
          }
          // Si la pregunta existe, se actualiza el texto de la pregunta
          if (qReq.getQuestion() != null) {
            existing.setQuestionText(qReq.getQuestion());
          }

          // Si hay respuestas que se quieren eliminar, se eliminan
          if (qReq.getRemoveAnswerIds() != null && !qReq.getRemoveAnswerIds().isEmpty()) {
            existing.getAnswers().removeIf(a -> a.getId() != null && qReq.getRemoveAnswerIds().contains(a.getId()));
          }

          if (qReq.getAnswers() != null && !qReq.getAnswers().isEmpty()) {
            // Se mapean las respuestas que ya existen
            Map<Long, QuizAnswer> existingAnswersById = new HashMap<>();
            for (QuizAnswer a : existing.getAnswers()) {
              if (a.getId() != null) {
                existingAnswersById.put(a.getId(), a);
              }
            }

            for (UpdateQuizRequest.AnswerUpdateDTO aReq : qReq.getAnswers()) {
              if (aReq.getId() != null) {
                QuizAnswer existingAnswer = existingAnswersById.get(aReq.getId());
                // Si la respuesta no existe, se lanza un error
                if (existingAnswer == null) {
                  throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Respuesta no encontrada: " + aReq.getId());
                }
                // Si la respuesta existe, se actualiza el texto de la respuesta
                if (aReq.getText() != null) {
                  existingAnswer.setAnswerText(aReq.getText());
                }
                // Si la respuesta existe, se actualiza la corrección de la respuesta
                if (aReq.getCorrect() != null) {
                  existingAnswer.setCorrect(aReq.getCorrect());
                }
              } else {
                // Si la respuesta no existe, se crea una nueva respuesta
                QuizAnswer newAnswer = new QuizAnswer();
                newAnswer.setAnswerText(Objects.requireNonNullElse(aReq.getText(), ""));
                newAnswer.setCorrect(Objects.requireNonNullElse(aReq.getCorrect(), Boolean.FALSE));
                newAnswer.setQuestion(existing);
                existing.getAnswers().add(newAnswer);
              }
            }
          }
        } else {
          // Si la pregunta no existe, se crea una nueva pregunta
          QuizQuestion newQuestion = new QuizQuestion();
          newQuestion.setQuiz(quiz);
          if (qReq.getQuestion() != null) {
            newQuestion.setQuestionText(qReq.getQuestion());
          }

          if (qReq.getAnswers() != null && !qReq.getAnswers().isEmpty()) {
            for (UpdateQuizRequest.AnswerUpdateDTO aReq : qReq.getAnswers()) {
              QuizAnswer newAnswer = new QuizAnswer();
              newAnswer.setAnswerText(Objects.requireNonNullElse(aReq.getText(), ""));
              newAnswer.setCorrect(Objects.requireNonNullElse(aReq.getCorrect(), Boolean.FALSE));
              newAnswer.setQuestion(newQuestion);
              newQuestion.getAnswers().add(newAnswer);
            }
          }
          quiz.getQuestions().add(newQuestion);
        }
      }
    }

    Quiz saved = quizRepository.save(quiz);

    return getDtQuiz(saved);
  }

  public DtQuiz getDtQuiz(Quiz quiz) {
      return new DtQuiz(
          quiz.getId(),
          quiz.getTitle(),
          quiz.getDueDate(),
          quiz.getCourse().getId(),
          quiz.getCreatedDate()
      );
  }

  public void deleteQuiz(Long quizId) {
      Quiz quiz = quizRepository.findById(quizId)
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz no encontrado"));

      quizRepository.delete(quiz);
  }

  public DtQuizSubmission getDtQuizSubmission(QuizSubmission submission) {
      List<Long> answerIds = submission.getAnswers() == null || submission.getAnswers().isEmpty()
              ? List.of()
              : Arrays.stream(submission.getAnswers().split(","))
                  .map(String::trim)
                  .filter(s -> !s.isEmpty())
                  .map(Long::parseLong)
                  .collect(Collectors.toList());

      return new DtQuizSubmission(
          submission.getId(),
          answerIds,
          submission.getNote(),
          userService.getUserDto(submission.getAuthor()),
          getDtQuiz(submission.getQuiz())
      );
  }

  public List<DtQuizSubmission> getQuizSubmissions(Long quizId) {
      quizRepository.findById(quizId)
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz no encontrado"));
      List<QuizSubmission> submissions = quizSubmissionRepository.findByQuizId(quizId);
      return submissions.stream().map(this::getDtQuizSubmission).collect(Collectors.toList());
  }

  public DtQuizSubmission getUserQuizSubmission(Long quizId, String userCi) {
      quizRepository.findById(quizId)
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz no encontrado"));
      List<QuizSubmission> existing = quizSubmissionRepository.findByQuizIdAndAuthorCi(quizId, userCi);
      if (existing.isEmpty()) {
          return null;
      }
      return getDtQuizSubmission(existing.get(0));
  }

  public DtQuizSubmission createQuizSubmission(Long quizId, String userCi, CreateQuizSubmissionRequest req) {
      if (req == null || req.getAnswerIds() == null || req.getAnswerIds().isEmpty()) {
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe seleccionar al menos una respuesta");
      }

      List<QuizSubmission> existing = quizSubmissionRepository.findByQuizIdAndAuthorCi(quizId, userCi);
      if (!existing.isEmpty()) {
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe una respuesta para este quiz, intenta editarla");
      }

      Quiz quiz = quizRepository.findById(quizId)
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz no encontrado"));

      User user = userRepository.findById(userCi)
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

      LocalDateTime dueDate = quiz.getDueDate();
      if (dueDate != null && dueDate.isBefore(LocalDateTime.now())) {
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha límite de entrega del quiz ha expirado");
      }

      List<Long> allAnswerIds = quiz.getQuestions().stream()
              .flatMap(q -> q.getAnswers().stream())
              .map(QuizAnswer::getId)
              .collect(Collectors.toList());
      List<Long> correctAnswerIds = quiz.getQuestions().stream()
              .flatMap(q -> q.getAnswers().stream())
              .filter(a -> Boolean.TRUE.equals(a.getCorrect()))
              .map(QuizAnswer::getId)
              .collect(Collectors.toList());

      List<Long> selectedInQuiz = req.getAnswerIds().stream()
              .filter(allAnswerIds::contains)
              .collect(Collectors.toList());

      long totalCorrect = correctAnswerIds.size();
      long correctSelected = selectedInQuiz.stream().filter(correctAnswerIds::contains).count();
      int note = totalCorrect == 0 ? 0 : (int) Math.round(100.0 * correctSelected / (double) totalCorrect);

      String answersCsv = req.getAnswerIds().stream().map(String::valueOf).collect(Collectors.joining(","));

      QuizSubmission submission = new QuizSubmission(
              answersCsv,
              note,
              quiz,
              user
      );

      QuizSubmission saved = quizSubmissionRepository.save(submission);

      return getDtQuizSubmission(saved);
  }
}

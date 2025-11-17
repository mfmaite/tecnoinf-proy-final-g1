package com.mentora.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.mentora.backend.model.Quiz;
import com.mentora.backend.model.QuizQuestion;
import com.mentora.backend.model.QuizAnswer;
import com.mentora.backend.repository.QuizRepository;
import com.mentora.backend.requests.UpdateQuizRequest;
import com.mentora.backend.dt.DtQuiz;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Objects;

@Service
public class QuizService {

  private final QuizRepository quizRepository;

  public QuizService(QuizRepository quizRepository) {
    this.quizRepository = quizRepository;
  }

  public DtQuiz editQuiz(Long quizId, UpdateQuizRequest req) {
    Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz no encontrado"));

    if (req.getTitle() != null) {
      quiz.setTitle(req.getTitle());
    }

    if (req.getDueDate() != null) {
      quiz.setExpirationDate(req.getDueDate());
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
          quiz.getExpirationDate(),
          quiz.getCourse().getId()
      );
  }

  public void deleteQuiz(Long quizId) {
      Quiz quiz = quizRepository.findById(quizId)
              .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz no encontrado"));

      quizRepository.delete(quiz);
  }
}

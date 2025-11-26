import { API_ENDPOINTS } from "@/config/api";
import { CreateQuizRequest } from "@/types/quiz";
import { ApiResponse } from "@/types/api-response";
import type { QuizSubmission } from "@/types/quiz-submission";

class QuizController {
  async createQuiz(courseId: string, payload: CreateQuizRequest, accessToken: string): Promise<ApiResponse<{ id: number }>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.COURSES}/${courseId}/quizzes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al crear quiz:', error);
      return { success: false, status: (error as any).status ?? 500, message: 'Error al crear quiz', data: undefined };
    }
  }

  async createSubmission(
    quizId: number | string,
    answerIds: number[],
    accessToken: string
  ): Promise<ApiResponse<QuizSubmission>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.QUIZZES}/${quizId}/submission`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ answerIds }),
      });
      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al crear submission de quiz:', error);
      return { success: false, status: (error as any).status ?? 500, message: 'Error al crear submission de quiz', data: undefined };
    }
  }

  async getMySubmission(
    quizId: number | string,
    accessToken: string
  ): Promise<ApiResponse<QuizSubmission | null>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.QUIZZES}/${quizId}/submission`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });
      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al obtener submission de quiz:', error);
      return { success: false, status: (error as any).status ?? 500, message: 'Error al obtener submission de quiz', data: undefined };
    }
  }

  async getSubmissions(
    quizId: number | string,
    accessToken: string
  ): Promise<ApiResponse<QuizSubmission[]>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.QUIZZES}/${quizId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });
      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al listar submissions de quiz:', error);
      return { success: false, status: (error as any).status ?? 500, message: 'Error al listar submissions de quiz', data: undefined };
    }
  }
}

export const quizController = new QuizController();

import { API_ENDPOINTS } from "@/config/api";
import { CreateQuizRequest } from "@/types/quiz";
import { ApiResponse } from "@/types/api-response";

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
}

export const quizController = new QuizController();

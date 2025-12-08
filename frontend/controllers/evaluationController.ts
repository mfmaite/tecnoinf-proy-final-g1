import { ApiResponse } from '@/types/api-response';
import { API_ENDPOINTS } from '@/config/api';

class EvaluationController {
  async createSubmission(
    evaluationId: string | number,
    formData: FormData,
    accessToken: string
  ): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.EVALUATIONS}/${evaluationId}/response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al crear entrega de evaluación:', error);
      return {
        success: false,
        status: (error as any)?.status ?? 500,
        message: 'Error al crear entrega de evaluación',
        data: undefined,
      };
    }
  }

  async gradeSubmission(
    evaluationId: string | number,
    studentCi: string,
    grade: number,
    accessToken: string
  ): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.EVALUATIONS}/${evaluationId}/grade`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grade, studentCi }),
      });

      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al calificar evaluación:', error);
      return {
        success: false,
        status: (error as any)?.status ?? 500,
        message: 'Error al calificar evaluación',
        data: undefined,
      };
    }
  }
}

export const evaluationController = new EvaluationController();



import { ApiResponse } from '@/types/api-response';
import { API_ENDPOINTS } from '@/config/api';

class ContentController {
  async createSimpleContent(
    courseId: string,
    formData: FormData,
    accessToken: string
  ): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.COURSES}/${courseId}/contents/simple`, {
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
      console.error('Error al crear contenido simple:', error);
      return {
        success: false,
        status: (error as any)?.status ?? 500,
        message: 'Error al crear contenido simple',
        data: undefined,
      };
    }
  }

  async createEvaluation(
    courseId: string,
    formData: FormData,
    accessToken: string
  ): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.COURSES}/${courseId}/contents/evaluation`, {
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
      console.error('Error al crear evaluación:', error);
      return {
        success: false,
        status: (error as any)?.status ?? 500,
        message: 'Error al crear evaluación',
        data: undefined,
      };
    }
  }

  async getContentByType(
    courseId: string,
    type: 'simpleContent' | 'evaluation' | 'quiz',
    contentId: number | string,
    accessToken: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.COURSES}/${courseId}/contents/${type}/${contentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });
      const parsed = await response.json();
      const { success, status, message } = parsed ?? {};
      const rawData = parsed?.data;

      return { success, status, message, data: rawData };
    } catch (error) {
      console.error('Error al obtener contenido:', error);
      return {
        success: false,
        status: (error as any)?.status ?? 500,
        message: 'Error al obtener contenido',
        data: undefined,
      };
    }
  }
}

export const contentController = new ContentController();



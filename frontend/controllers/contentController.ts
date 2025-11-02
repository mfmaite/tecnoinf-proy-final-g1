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

      const { success, code, message, data } = await response.json();
      return { success, code, message, data };
    } catch (error) {
      console.error('Error al crear contenido simple:', error);
      return {
        success: false,
        code: (error as any)?.code ?? 500,
        message: 'Error al crear contenido simple',
        data: undefined,
      };
    }
  }
}

export const contentController = new ContentController();



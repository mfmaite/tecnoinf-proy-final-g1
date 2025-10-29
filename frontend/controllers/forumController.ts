import { API_ENDPOINTS } from '@/config/api';
import { ApiResponse } from '@/types/api-response';
import { ForumPageData } from '@/types/forum';

class ForumController {
  async getForumById(forumId: string, accessToken: string): Promise<ApiResponse<ForumPageData>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.FORUM}/${forumId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });
      const json = await response.json();
      const { success, code, message, data } = json;
      return { success, code, message, data };
    } catch (error) {
      console.error('Error al obtener el foro:', error);
      return { success: false, code: 500, message: 'Error al obtener foro', data: undefined };
    }
  }
}

export const forumController = new ForumController();



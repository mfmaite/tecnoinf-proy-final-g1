import { API_ENDPOINTS } from '@/config/api';
import { ApiResponse } from '@/types/api-response';
import { ForumPageData, ForumPostPageData } from '@/types/forum';

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
      const { success, status, message, data } = json;
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al obtener el foro:', error);
      return { success: false, status: (error as any).status ?? 500, message: 'Error al obtener foro', data: undefined };
    }
  }

  async getPostById(postId: string, accessToken: string): Promise<ApiResponse<ForumPostPageData>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.POSTS}/${postId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });
      const json = await response.json();
      const { success, status, message, data } = json;
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al obtener el post:', error);
      return { success: false, status: (error as any).status ?? 500, message: 'Error al obtener post', data: undefined };
    }
  }
}

export const forumController = new ForumController();



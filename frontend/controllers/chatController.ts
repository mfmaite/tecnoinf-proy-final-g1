import { API_ENDPOINTS } from '@/config/api';
import { ApiResponse } from '@/types/api-response';
import { Chat } from '@/types/chat';

class ChatController {
  async getChats(accessToken: string): Promise<ApiResponse<Chat[]>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.CHATS}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      });

      const { success, code, message, data } = await response.json();
      return { success, code, message, data };
    } catch (error) {
      console.error('Error al cargar chats:', error);
      return {
        success: false,
        code: (error as any).code ?? 500,
        message: 'Error al cargar chats',
        data: undefined,
      };
    }
  }
}

export const chatController = new ChatController();



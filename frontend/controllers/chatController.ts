import { API_ENDPOINTS } from '@/config/api';
import { ApiResponse } from '@/types/api-response';
import { Chat } from '@/types/chat';
import { Message } from '@/types/message';

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

  async getMessages(chatId: number, accessToken: string): Promise<ApiResponse<Message[]>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.CHATS}/${chatId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      });

      const { success, code, message, data } = await response.json();
      return { success, code, message, data };
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      return {
        success: false,
        code: (error as any).code ?? 500,
        message: 'Error al cargar mensajes',
        data: undefined,
      };
    }
  }

  async sendMessage(recipientCi: string, message: string, accessToken: string): Promise<ApiResponse<Message>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.CHATS}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipientCi, message }),
      });

      const { success, code, data, message: msg } = await response.json();
      return { success, code, data, message: msg };
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      return {
        success: false,
        code: (error as any).code ?? 500,
        message: 'Error al enviar mensaje',
        data: undefined,
      };
    }
  }
}

export const chatController = new ChatController();



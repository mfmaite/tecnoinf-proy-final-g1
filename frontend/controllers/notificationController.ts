import { API_ENDPOINTS } from "@/config/api";
import type { ApiResponse } from "@/types/api-response";
import type { NotificationDto } from "@/types/notification";

class NotificationController {
  async getNotifications(accessToken: string): Promise<ApiResponse<NotificationDto[]>> {
    try {
      const res = await fetch(API_ENDPOINTS.NOTIFICATIONS, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const json = await res.json();
      const { success, status, message, data } = json as ApiResponse<NotificationDto[]>;
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      return { success: false, status: 500, message: 'Error al obtener notificaciones', data: undefined };
    }
  }

  async markAsRead(notificationId: string, accessToken: string): Promise<ApiResponse<void>> {
    try {
      const res = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
      const json = await res.json();
      const { success, status, message, data } = json as ApiResponse<void>;
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      return { success: false, status: 500, message: 'Error al marcar notificación como leída', data: undefined };
    }
  }
}

export const notificationController = new NotificationController();

import { API_ENDPOINTS } from '../config/api';
import { ApiResponse } from '@/types/api-response';
import { UserSignUpData, UserResponse } from '@/types/user';
import { ChangePasswordRequest } from '@/types/user';

type UserFilter = "todos" | "profesores" | "estudiantes" | "administradores";

type UserOrder = "name_asc" | "name_desc" | "ci_asc" | "ci_desc";
class UserController {
  async createUser(userData: UserSignUpData, accessToken: string): Promise<ApiResponse<UserResponse>> {
    try {
      const response = await fetch(API_ENDPOINTS.USERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(userData),
      });

      const { success, status, message, data } = await response.json();

      return {
        success,
        status,
        data,
        message,
      };
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      return {
        success: false,
        status: (error as any).status ?? 500,
        message: 'Error al crear el usuario',
        data: undefined,
      };
    }
  }

  async getUsers(
    accessToken: string,
    filter: UserFilter = "todos",
    order?: UserOrder
  ): Promise<ApiResponse<UserResponse[]>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}?${filter ? `filter=${filter}` : ''}${order ? filter ? `&order=${order}` : `order=${order}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const { success, status, message, data } = await response.json();

      return {
        success,
        status,
        data,
        message,
      };
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      return {
        success: false,
        status: (error as any).status ?? 500,
        message: 'Error al cargar usuarios',
        data: undefined,
      };
    }
  }

  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.RESET_PASSWORD}`, {
        method: 'POST',
        body: JSON.stringify({ token, newPassword, confirmPassword }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { success, status, message, data } = await response.json();

      return {
        success,
        status,
        data,
        message,
      };
    } catch (error) {
      console.error('Error al restablecer la contraseña:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.PASSWORD_RECOVERY}?email=${email}`, {
        method: 'GET',
      });

      const { success, status, message, data } = await response.json();

      return {
        success,
        status,
        data,
        message,
      };
    } catch (error) {
      console.error('Error al enviar el email de recuperación de contraseña:', error);
      return {
        success: false,
          status: (error as any).status ?? 500,
        message: 'Error al enviar el email de recuperación de contraseña',
        data: undefined,
      };
    }
  }

  async changePassword(
    payload: ChangePasswordRequest,
    accessToken: string
  ): Promise<ApiResponse<undefined>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const { success, status, message } = await response.json();
      return { success, status, message };
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      return {
        success: false,
        status: (error as any).status ?? 500,
        message: 'Error al cambiar la contraseña',
        data: undefined,
      };
    }
  }
}

export const userController = new UserController();

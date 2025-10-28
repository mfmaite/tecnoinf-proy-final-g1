import { API_ENDPOINTS } from '../config/api';
import { ApiResponse } from '@/types/api-response';
import { UserSignUpData, UserResponse } from '@/types/user';

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

      const { success, code, message, data } = await response.json();

      return {
        success,
        code,
        data,
        message,
      };
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      return {
        success: false,
        code: (error as any).code ?? 500,
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

      const { success, code, message, data } = await response.json();

      return {
        success,
        code,
        data,
        message,
      };
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      return {
        success: false,
        code: (error as any).code ?? 500,
        message: 'Error al cargar usuarios',
        data: undefined,
      };
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.PASSWORD_RECOVERY}?email=${email}`, {
        method: 'GET',
      });

      const { success, code, message, data } = await response.json();

      return {
        success,
        code,
        data,
        message,
      };
    } catch (error) {
      console.error('Error al enviar el email de recuperación de contraseña:', error);
      return {
        success: false,
        code: (error as any).code ?? 500,
        message: 'Error al enviar el email de recuperación de contraseña',
        data: undefined,
      };
    }
  }
}

export const userController = new UserController();

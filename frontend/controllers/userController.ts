import { UserSignUpData, ApiError } from '../types/user';
import { API_ENDPOINTS } from '../config/api';

class UserController {
  async createUser(userData: UserSignUpData, accessToken: string) {
    try {
      const response = await fetch(API_ENDPOINTS.USERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          data,
          message: 'Usuario creado exitosamente',
        };
      } else {
        console.error('Error al crear el usuario:', data);
        return {
          success: false,
          message: data.message || 'Error al crear el usuario',
        };
      }
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: 'Error inesperado' };
  }
}

export const userController = new UserController();

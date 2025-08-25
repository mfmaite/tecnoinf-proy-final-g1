import { API_ENDPOINTS } from '../config/api';
import { UserSignUpData, UserResponse, ApiError } from '../types/user';

class UserController {
  async signUp(userData: UserSignUpData): Promise<UserResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.USERS.SIGNUP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      return data;
    } catch (error) {
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

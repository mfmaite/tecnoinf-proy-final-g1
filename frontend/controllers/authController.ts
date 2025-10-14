import { API_ENDPOINTS } from '../config/api';
import { UserLoginData, LoginResponse, ApiError } from '../types/user';

class AuthController {
  async login(credentials: UserLoginData): Promise<LoginResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      if (data.success && data.data?.jwt) {
        localStorage.setItem('authToken', data.data.jwt);
        try {
          localStorage.setItem('authUser', JSON.stringify(data.data.user));
        } catch {}
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: 'Error inesperado' };
  }
}

export const authController = new AuthController();


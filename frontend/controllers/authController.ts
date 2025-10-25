import { getSession, signOut } from 'next-auth/react';
import { API_ENDPOINTS } from '../config/api';
import { UserLoginData, LoginResponse, ApiError } from '../types/user';

class AuthController {
  async login(credentials: UserLoginData): Promise<LoginResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
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

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    await signOut({
      redirect: false,
      callbackUrl: '/login'
    });
  }

  async getToken(): Promise<string | null> {
    const session = await getSession();
    return session?.accessToken || null;
  }

  async isAuthenticated(): Promise<boolean> {
    const session = await getSession();
    return !!session?.user;
  }

  async getCurrentUser() {
    const session = await getSession();
    return session?.user || null;
  }

  private handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: 'Error inesperado' };
  }
}

export const authController = new AuthController();


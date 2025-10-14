import { API_ENDPOINTS } from '../config/api';
import { UserLoginData, LoginResponse, ApiError } from '../types/user';

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') return;
  const encoded = encodeURIComponent(value);
  document.cookie = `${name}=${encoded}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

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
        const sevenDaysInSeconds = 7 * 24 * 60 * 60;
        setCookie('authToken', data.data.jwt, sevenDaysInSeconds);
        try {
          localStorage.setItem('authToken', data.data.jwt);
          localStorage.setItem('authUser', JSON.stringify(data.data.user));
        } catch {}
      }

      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  logout(): void {
    deleteCookie('authToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }

  getToken(): string | null {
    return getCookie('authToken') || localStorage.getItem('authToken');
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


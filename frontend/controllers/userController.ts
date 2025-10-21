import { UserSignUpData, ApiError, UserResponse } from '../types/user';
import { API_ENDPOINTS } from '../config/api';

type UserFilter = "todos" | "profesores" | "estudiantes" | "administradores";

type UserOrder = "name_asc" | "name_desc" | "ci_asc" | "ci_desc";
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

  async getUsers(
    accessToken: string,
    filter: UserFilter = "todos",
    order?: UserOrder
  ): Promise<UserResponse[]> {
    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}?${filter ? `filter=${filter}` : ''}${order ? filter ? `&order=${order}` : `order=${order}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log(response);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }

      console.error('Error al cargar profesores:', response.statusText);
      return [];
    } catch (error) {
      console.error('Error al cargar profesores:', error);
      return [];
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

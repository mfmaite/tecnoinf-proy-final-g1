import { API_ENDPOINTS } from '../config/api';
import { ApiResponse } from '@/types/api-response';
import { UserResponse } from '@/types/user';
import { ChangePasswordRequest, CreateUserRequest } from '@/types/user';
import { UserActivity } from '@/types/activity';
import { PendingEvaluationsAndQuizzes } from '@/types/pending';
import { BulkCreateUsersResponse } from '@/types/bulk-create-users-response';

type UserFilter = "todos" | "profesores" | "estudiantes" | "administradores";

type UserOrder = "name_asc" | "name_desc" | "ci_asc" | "ci_desc";
class UserController {
  async createUser(userData: CreateUserRequest, accessToken: string, file?: File): Promise<ApiResponse<UserResponse>> {
    try {
      const form = new FormData();
      form.append('ci', userData.ci);
      form.append('name', userData.name);
      form.append('email', userData.email);
      form.append('password', userData.password);
      form.append('role', userData.role);
      if (userData.description) form.append('description', userData.description);
      if (file) form.append('profilePicture', file, file.name);

      const response = await fetch(API_ENDPOINTS.USERS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: form,
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

  async getProfile(
    accessToken: string,
    ci?: string
  ): Promise<ApiResponse<UserResponse>> {
    try {
      const search = new URLSearchParams();
      if (ci) search.set('ci', ci);
      const qs = search.toString();

      const response = await fetch(`${API_ENDPOINTS.USERS}/profile${qs ? `?${qs}` : ''}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al obtener el perfil de usuario:', error);
      return {
        success: false,
        status: (error as any).status ?? 500,
        message: 'Error al obtener el perfil de usuario',
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

  async getUserActivities(
    accessToken: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<ApiResponse<UserActivity[]>> {
    try {
      const search = new URLSearchParams();
      if (params?.startDate) search.set('startDate', params.startDate);
      if (params?.endDate) search.set('endDate', params.endDate);
      const qs = search.toString();

      const response = await fetch(`${API_ENDPOINTS.USERS}/activities${qs ? `?${qs}` : ''}`, {
        method: 'GET',
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
      console.error('Error al obtener actividades del usuario:', error);
      return {
        success: false,
        status: (error as any).status ?? 500,
        message: 'Error al obtener actividades del usuario',
        data: undefined,
      };
    }
  }

  async getPending(
    accessToken: string
  ): Promise<ApiResponse<PendingEvaluationsAndQuizzes>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al obtener pendientes del usuario:', error);
      return {
        success: false,
        status: (error as any).status ?? 500,
        message: 'Error al obtener pendientes del usuario',
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

  async updateCurrentUser(
    params: { name?: string; email?: string; description?: string },
    accessToken: string,
    pictureFile?: File | null
  ): Promise<ApiResponse<UserResponse>> {
    try {
      const form = new FormData();
      if (params.name !== undefined) form.append('name', params.name);
      if (params.email !== undefined) form.append('email', params.email);
      if (params.description !== undefined) form.append('description', params.description);
      if (pictureFile) form.append('picture', pictureFile, pictureFile.name);

      const response = await fetch(`${API_ENDPOINTS.USERS}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: form,
      });

      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      return {
        success: false,
        status: (error as any).status ?? 500,
        message: 'Error al actualizar el usuario',
        data: undefined,
      };
    }
  }

  async uploadUsersCsv(
    file: File,
    accessToken: string
  ): Promise<ApiResponse<BulkCreateUsersResponse>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_ENDPOINTS.USERS}/csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al crear usuarios desde CSV:', error);
      return {
        success: false,
        status: (error as any).status ?? 500,
        message: 'Error al crear usuarios desde CSV',
        data: undefined as any,
      };
    }
  }
}

export const userController = new UserController();

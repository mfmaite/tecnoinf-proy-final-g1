import { ApiResponse } from '@/types/api-response';
import { API_ENDPOINTS } from '../config/api';
import { CourseFormData } from '@/app/(logged)/admin/courses/new/components/create-course-form';
import { CourseViewData } from '@/types/content';
import { Course } from '@/types/course';
import { BulkCreateCoursesResponse } from '@/types/bulk-create-courses-response';
import { UserResponse } from '@/types/user';
import { BulkMatricularUsuariosResponse } from '@/types/bulk-matricular-usuarios-response';

class CourseController {
  async getCourseById(courseId: string, accessToken: string): Promise<ApiResponse<CourseViewData>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.COURSES}/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });

      const { success, status, message, data } = await response.json();

      return {
        success,
        status,
        data,
        message,
      };
    } catch (error) {
      console.error('Error al obtener el curso:', error);
      return {
        success: false,
        status: (error as any).status ?? 500,
        message: 'Error al obtener el curso',
        data: undefined,
      };
    }
  }

  async calculateFinalGrades(courseId: string, accessToken: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.COURSES}/${courseId}/final-grades`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });
      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al calificar curso:', error);
      return {
        success: false,
        status: (error as any).status ?? 500,
        message: 'Error al calificar curso',
        data: undefined,
      };
    }
  }

  async publishFinalGrade(
    courseId: string,
    studentCi: string,
    grade: number,
    accessToken: string
  ): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.COURSES}/${courseId}/final-grades`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentCi, grade }),
      });
      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al publicar calificación final:', error);
      return {
        success: false,
        status: (error as any).status ?? 500,
        message: 'Error al publicar calificación final',
        data: undefined as any,
      };
    }
  }

  async createCourse(courseData: CourseFormData, accessToken: string): Promise<ApiResponse<Course>> {
    try {
      const response = await fetch(API_ENDPOINTS.COURSES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(courseData),
      });

      const { success, status, message, data } = await response.json();

      return {
        success,
        status,
        data,
        message,
      };
    } catch (error) {
      console.error('Error al crear el curso:', error);

      return {
        success: false,
        status: (error as any).status ?? 500,
        message: 'Error al crear el curso',
        data: undefined,
      };
    }
  }

  async getCourses(accessToken: string): Promise<ApiResponse<Course[]>> {
    try {
      const response = await fetch(API_ENDPOINTS.COURSES, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return {
            success: true,
            status: response.status,
            data: data.data,
            message: 'Cursos obtenidos correctamente',
          };
        }
      }

      console.error('Error al cargar cursos:', response.statusText);
      return {
        success: false,
        status: response.status,
        message: 'Error al cargar cursos',
        data: undefined,
      };
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      return {
        success: false,
        status: (error as any).status ?? 500,
        message: 'Error al cargar cursos',
        data: undefined,
      };
    }
  }

  async uploadCoursesCsv(file: File, accessToken: string): Promise<ApiResponse<BulkCreateCoursesResponse>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_ENDPOINTS.COURSES}/csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const { success, status, message, data } = await response.json();

      return {
        success,
        status,
        message,
        data,
      };
    } catch (error) {
      console.error('Error al crear cursos desde CSV:', error);
      return {
        success: false,
        status: (error as any).status ?? 500,
        message: 'Error al crear cursos desde CSV',
        data: undefined,
      };
    }
  }

  async getParticipants(courseId: string, accessToken: string): Promise<ApiResponse<UserResponse[]>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.COURSES}/${courseId}/participants`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });
      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al obtener participantes:', error);
      return {
        success: false,
        status: (error as any).status ?? 500,
        message: 'Error al obtener participantes',
        data: undefined
      };
    }
  }

  async getNonParticipants(courseId: string, accessToken: string): Promise<ApiResponse<UserResponse[]>> {
    try {
      const response = await fetch(`${API_ENDPOINTS.COURSES}/${courseId}/non-participants`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });
      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al obtener no participantes:', error);
      return { success: false, status: (error as any).status ?? 500, message: 'Error al obtener no participantes', data: undefined };
    }
  }

  async addParticipants(courseId: string, cis: string[], accessToken: string) {
    try {
      const response = await fetch(`${API_ENDPOINTS.COURSES}/${courseId}/participants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantIds: cis }),
      });
      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al agregar participantes:', error);
      return { success: false, status: (error as any).status ?? 500, message: 'Error al agregar participantes', data: undefined };
    }
  }

  async addParticipantsCsv(
    courseId: string,
    file: File,
    accessToken: string
  ): Promise<ApiResponse<BulkMatricularUsuariosResponse>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_ENDPOINTS.COURSES}/${courseId}/participants/csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });
      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al agregar participantes desde CSV:', error);
      return {
        success: false,
        status: (error as any).status ?? 500,
        message: 'Error al agregar participantes desde CSV',
        data: undefined as any,
      };
    }
  }

  async deleteParticipants(courseId: string, cis: string[], accessToken: string) {
    try {
      const response = await fetch(`${API_ENDPOINTS.COURSES}/${courseId}/participants`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantIds: cis }),
      });
      const { success, status, message, data } = await response.json();
      return { success, status, message, data };
    } catch (error) {
      console.error('Error al eliminar participantes:', error);
      return { success: false, status: (error as any).status ?? 500, message: 'Error al eliminar participantes', data: undefined };
    }
  }
}

export const courseController = new CourseController();

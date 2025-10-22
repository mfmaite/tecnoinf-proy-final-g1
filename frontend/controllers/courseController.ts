import { ApiResponse } from '@/types/api-response';
import { API_ENDPOINTS } from '../config/api';
import { CourseFormData } from '@/app/(logged)/admin/courses/new/components/create-course-form';
import { CourseViewData } from '@/types/content';
import { Course } from '@/types/course';

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

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener el curso:', error);
      throw this.handleError(error);
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

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          code: response.status,
          data: data.data,
          message: 'Curso creado exitosamente',
        };
      } else {
        console.error('Error al crear el curso:', data);
        return {
          success: false,
          code: response.status,
          message: data.message || 'Error al crear el curso',
          data: undefined,
        };
      }
    } catch (error) {
      console.error('Error al crear el curso:', error);
      throw this.handleError(error);
    }
  }

  async getCourses(accessToken: string): Promise<any[]> {
    try {
      const response = await fetch(API_ENDPOINTS.COURSES, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }

      console.error('Error al cargar cursos:', response.statusText);
      return [];
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      return [];
    }
  }

  private handleError(error: unknown): { message: string, code?: number } {
    if (error instanceof Error) {
      return { message: error.message, code: (error as any).code ?? 500 };
    }
    return { message: 'Error inesperado', code: (error as any).code ?? 500 };
  }
}

export const courseController = new CourseController();

import { ApiError } from '../types/user';
import { API_ENDPOINTS } from '../config/api';
import { CourseFormData } from '../app/(logged)/courses/components/create-course-form';

class CourseController {
  async createCourse(courseData: CourseFormData, accessToken: string) {
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
          data,
          message: 'Curso creado exitosamente',
        };
      } else {
        console.error('Error al crear el curso:', data);
        return {
          success: false,
          message: data.message || 'Error al crear el curso',
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

  private handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: 'Error inesperado' };
  }
}

export const courseController = new CourseController();

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

      const { success, code, message, data } = await response.json();

      return {
        success,
        code,
        data,
        message,
      };
    } catch (error) {
      console.error('Error al obtener el curso:', error);
      return {
        success: false,
        code: (error as any).code ?? 500,
        message: 'Error al obtener el curso',
        data: undefined,
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

      const { success, code, message, data } = await response.json();

      return {
        success,
        code,
        data,
        message,
      };
    } catch (error) {
      console.error('Error al crear el curso:', error);

      return {
        success: false,
        code: (error as any).code ?? 500,
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
            code: response.status,
            data: data.data,
            message: 'Cursos obtenidos correctamente',
          };
        }
      }

      console.error('Error al cargar cursos:', response.statusText);
      return {
        success: false,
        code: response.status,
        message: 'Error al cargar cursos',
        data: undefined,
      };
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      return {
        success: false,
        code: (error as any).code ?? 500,
        message: 'Error al cargar cursos',
        data: undefined,
      };
    }
  }
}

export const courseController = new CourseController();

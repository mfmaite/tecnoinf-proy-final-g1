import { Course } from './course';

export interface BulkCreateCoursesResponse {
  createdCourses: Course[];
  errors: string[];
}



import { Course } from "./course";
import { Forum } from "./forum";

export type ContentType = 'simpleContent' | 'evaluation' | 'quiz';

export type BaseContent = {
  id: number;
  title: string;
  createdDate: string;
  type: ContentType;
};

export type SimpleContent = BaseContent & {
  type: 'simpleContent';
  content: string | null;
  fileName: string | null;
  fileUrl: string | null;
};

export type EvaluationContent = BaseContent & {
  type: 'evaluation';
  content: string | null;
  fileName: string | null;
  fileUrl: string | null;
  dueDate: string | null;
};

export type QuizContent = BaseContent & {
  type: 'quiz';
};

export type CourseContent = SimpleContent | EvaluationContent | QuizContent;

export type CourseViewData = {
  course: Course
  contents: CourseContent[]
  forums: Forum[]
}

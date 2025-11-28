import { api } from "./api";

// ───── Tipos comunes ─────
export interface BaseContent {
  id: number;
  title: string;
  dueDate?: string | null;
  createdDate?: string | null;
  type: "evaluation" | "quiz" | "simpleContent";
}

// ───── Evaluation ─────
export interface EvaluationContent extends BaseContent {
  content?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  type: "evaluation";
}

export interface EvaluationDetail {
  evaluation: EvaluationContent;
  submissions: any[];
}

// ───── Quiz ─────
export interface QuizQuestion {
  id: number;
  question: string;
  answers: { id: number; text: string; correct: boolean }[];
}

export interface QuizContent extends BaseContent {
  type: "quiz";
}

export interface QuizDetail {
  quiz: QuizContent;
  questions: QuizQuestion[];
}

// ───── Simple content ─────
export interface SimpleContent extends BaseContent {
  content?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  type: "simpleContent";
}

export type ContentDetail = SimpleContent | EvaluationDetail | QuizDetail;
export type AnyContent = SimpleContent | EvaluationContent | QuizContent;

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ─────────────────────────────────────
// 🔍 GET /courses/:courseId/contents/:type/:contentId
// ─────────────────────────────────────
export async function getContentByType(
  courseId: string,
  type: "simpleContent" | "evaluation" | "quiz",
  contentId: string | number
): Promise<ContentDetail> {
  const resp = await api.get<ApiResponse<any>>(
    `/courses/${courseId}/contents/${type}/${contentId}`
  );

  if (!resp.data.success)
    throw new Error(resp.data.message || "Error obteniendo contenido");

  return resp.data.data;
}

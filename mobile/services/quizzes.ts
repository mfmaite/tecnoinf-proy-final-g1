import { api } from "./api";

export interface QuizSubmission {
  id: number;
  note?: number | null;
  answerIds?: number[];
}

interface ApiResponse<T> {
  success: boolean;
  status?: number;
  message?: string;
  data: T;
}

export async function getMyQuizSubmission(quizId: string | number): Promise<QuizSubmission | null> {
  const { data } = await api.get<ApiResponse<QuizSubmission | null>>(`/quizzes/${quizId}/submission`);
  if (!data.success) throw new Error(data.message || "No se pudo obtener tu envío");
  return data.data ?? null;
}

export async function createQuizSubmission(quizId: string | number, answerIds: number[]): Promise<QuizSubmission> {
  const { data } = await api.post<ApiResponse<QuizSubmission>>(`/quizzes/${quizId}/submission`, { answerIds });
  if (!data.success || !data.data) throw new Error(data.message || "No se pudo enviar el quiz");
  return data.data;
}



import { api } from "./api";

interface ApiResponse<T> {
  success: boolean;
  status?: number;
  message?: string;
  data: T;
}

export interface QuizSubmission {
  id: number;
  answerIds: number[];
  note?: number | null;
  author: {
    ci: string;
    name: string;
  };
}

// ─────────────────────────────────────────────
// 📝 POST /quizzes/:quizId/submission
// Crear mi entrega del quiz
// ─────────────────────────────────────────────
export async function submitQuiz(
  quizId: number | string,
  answerIds: number[]
): Promise<QuizSubmission> {
  try {
    const response = await api.post<ApiResponse<QuizSubmission>>(
      `/quizzes/${quizId}/submission`,
      { answerIds }
    );

    if (!response.data.success) throw new Error(response.data.message);
    return response.data.data;
  } catch (e) {
    console.error("[submitQuiz] Error:", e);
    throw new Error("Error enviando respuestas del quiz");
  }
}

// ─────────────────────────────────────────────
// 👤 GET /quizzes/:quizId/submission
// Obtener MI entrega del quiz
// ─────────────────────────────────────────────
export async function getMyQuizSubmission(
  quizId: number | string
): Promise<QuizSubmission | null> {
  const response = await api.get<ApiResponse<QuizSubmission | null>>(
    `/quizzes/${quizId}/submission`
  );
  return response.data.data || null;
}

// ─────────────────────────────────────────────
// 👥 GET /quizzes/:quizId/submissions
// Listar TODAS las entregas (solo profesor)
// ─────────────────────────────────────────────
export async function getQuizSubmissions(
  quizId: number | string
): Promise<QuizSubmission[]> {
  const response = await api.get<ApiResponse<QuizSubmission[]>>(
    `/quizzes/${quizId}/submissions`
  );

  return response.data.data || [];
}

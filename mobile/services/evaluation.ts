import { api } from "./api";

interface ApiResponse<T> {
  success: boolean;
  status?: number;
  message?: string;
  data: T;
}

export interface EvaluationSubmission {
  id: number;
  fileName?: string;
  fileUrl?: string;
  solution?: string;
  note?: number | null;
  author: {
    ci: string;
    name: string;
  };
}

// ─────────────────────────────────────────────
// 📤 POST /evaluations/:evaluationId/response
// Enviar archivo o texto de evaluación
// ─────────────────────────────────────────────
export async function submitEvaluation(
  evaluationId: number | string,
  formData: FormData
): Promise<EvaluationSubmission> {
  const response = await api.post<ApiResponse<EvaluationSubmission>>(
    `/evaluations/${evaluationId}/response`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  if (!response.data.success) throw new Error(response.data.message);
  return response.data.data;
}

// ─────────────────────────────────────────────
// 🧾 GET /evaluations/:evaluationId/responses
// Solo profesor — ver entregas
// ─────────────────────────────────────────────
export async function getEvaluationSubmissions(
  evaluationId: number | string
): Promise<EvaluationSubmission[]> {
  const response = await api.get<ApiResponse<EvaluationSubmission[]>>(
    `/evaluations/${evaluationId}/responses`
  );

  return response.data.data || [];
}

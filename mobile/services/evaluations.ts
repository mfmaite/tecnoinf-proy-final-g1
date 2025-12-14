import { api } from "./api";

export type EvaluationSubmission = {
  id: number;
  fileName?: string | null;
  fileUrl?: string | null;
  solution?: string | null;
  note?: number | null;
  author?: {
    ci?: string;
    name?: string;
  } | null;
};

type ApiResponse<T> = {
  success: boolean;
  status?: number;
  message?: string;
  data: T;
};

export type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

export async function createEvaluationSubmission(
  evaluationId: string | number,
  params: { solution?: string; file?: UploadFile }
): Promise<EvaluationSubmission> {
  const form = new FormData();
  if (params.solution && params.solution.trim().length > 0) {
    form.append("solution", params.solution.trim());
  }
  if (params.file && params.file.uri) {
    form.append("file", {
      uri: params.file.uri,
      name: params.file.name,
      type: params.file.type,
    } as any);
  }

  const response = await api.post<ApiResponse<EvaluationSubmission>>(
    `/evaluations/${encodeURIComponent(String(evaluationId))}/response`,
    form,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const { success, message, data } = response.data;
  if (!success || !data) {
    throw new Error(message || "No se pudo enviar la entrega.");
  }
  return data;
}



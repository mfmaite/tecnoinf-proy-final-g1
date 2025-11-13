import { EvaluationContent } from "./content";
import { UserResponse } from "./user";

export type EvaluationSubmission = {
  id: number;
  fileName: string;
  fileUrl: string;
  note: number;
  author: UserResponse;
  evaluation: EvaluationContent;
}

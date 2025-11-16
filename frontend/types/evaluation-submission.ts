import { EvaluationContent } from "./content";
import { UserResponse } from "./user";

export type EvaluationSubmission = {
  id: number;
  solution: string;
  fileName: string;
  fileUrl: string;
  note: number;
  author: UserResponse;
  evaluation: EvaluationContent;
}

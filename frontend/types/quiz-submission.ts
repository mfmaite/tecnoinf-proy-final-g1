import type { QuizContent } from "./content";
import type { UserResponse } from "./user";

export type QuizSubmission = {
  id: number;
  answerIds: number[];
  note: number | null;
  author: UserResponse;
  quiz: QuizContent;
  type: 'quiz';
}



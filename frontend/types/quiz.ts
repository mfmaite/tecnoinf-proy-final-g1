export interface CreateQuizRequest {
  title: string;
  dueDate: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  text: string;
  correct: boolean;
}

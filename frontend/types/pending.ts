export type PendingEvaluationsAndQuizzes = {
  evaluations: {
    id: number;
    title: string;
    content: string | null;
    fileName: string | null;
    fileUrl: string | null;
    createdDate: string;
    dueDate: string | null;
    courseId: string;
    type?: 'evaluation';
  }[];
  quizzes: {
    id: number;
    title: string;
    dueDate: string | null;
    courseId: string;
    createdDate: string;
    type?: 'quiz';
  }[];
};



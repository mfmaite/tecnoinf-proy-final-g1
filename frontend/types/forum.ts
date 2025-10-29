export enum ForumType {
  ANNOUNCEMENTS = 'ANNOUNCEMENTS',
  CONSULTS = 'CONSULTS',
}

export type Forum = {
  id: string;
  type: ForumType;
  courseId: string;
}

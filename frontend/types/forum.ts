export enum ForumType {
  ANNOUNCEMENTS = 'ANNOUNCEMENTS',
  CONSULTS = 'CONSULTS',
}

export type Forum = {
  id: string;
  type: ForumType;
  courseId: string;
}

export type ForumPost = {
  id: number;
  authorCi: string;
  authorName: string;
  authorPictureUrl: string | null;
  message: string;
  createdDate: string;
}

export type ForumPageData = {
  forum: Forum;
  posts: ForumPost[];
}

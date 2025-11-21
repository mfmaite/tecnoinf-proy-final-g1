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

export type ForumPostResponse = {
  id: number;
  message: string;
  createdDate: string;
  authorCi: string;
  authorName: string;
  postId: number;
  authorPictureUrl?: string | null;
}

export type ForumPageData = {
  forum: Forum;
  posts: ForumPost[];
}

export type ForumPostPageData = {
  forum: Forum;
  post: ForumPost;
  responses: ForumPostResponse[];
}

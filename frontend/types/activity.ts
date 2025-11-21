export type ActivityType = 'FORUM_PARTICIPATION' | 'ACTIVITY_SENT';

export interface UserActivity {
  id: number;
  type: ActivityType;
  description: string | null;
  link: string;
  createdDate: string;
}

import type { UserResponse } from '@/types/user';

export interface Chat {
  id: number;
  participant1: UserResponse | null;
  participant2: UserResponse | null;
}



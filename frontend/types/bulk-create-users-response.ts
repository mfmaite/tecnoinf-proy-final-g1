import { UserResponse } from './user';

export type BulkCreateUsersResponse = {
  createdUsers: UserResponse[];
  errors: string[];
};



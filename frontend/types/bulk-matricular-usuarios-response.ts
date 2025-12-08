import { UserResponse } from './user';

export type BulkMatricularUsuariosResponse = {
  matriculados: UserResponse[];
  errors: string[];
};



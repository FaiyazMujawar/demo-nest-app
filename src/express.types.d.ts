declare namespace Express {
  import { Role } from './roles/role.enum';

  export interface UserEntity {
    id: string;
    role: Role;
    market: number;
    username: string;
  }
  interface Request {
    user?: UserEntity;
  }
}

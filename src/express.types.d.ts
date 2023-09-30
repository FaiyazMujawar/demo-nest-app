declare namespace Express {
  import { Role } from './roles/role.enum';

  export interface UserEntity {
    id: string;
    username: string;
    superadmin: boolean;
    markets: { [market: number]: Role };
  }
  interface Request {
    user?: UserEntity;
    market?: number;
  }
}

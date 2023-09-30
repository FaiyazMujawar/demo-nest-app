import { Role } from '../roles/role.enum';

export interface AddUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  contact: number;
  role: Role;
  markets: { [market: number]: Role };
}

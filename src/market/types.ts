import { Role } from '../roles/role.enum';

export interface MarketRequest {
  name: string;
  code: number;
}

export interface MarketAssignmentRequest {
  userId: string;
  markets: { [market: number]: Role };
}

import { Market, User } from '../schema';

export function toUserResponse(user: User, market: Market | undefined) {
  delete user.password;
  return {
    ...user,
    market,
  };
}

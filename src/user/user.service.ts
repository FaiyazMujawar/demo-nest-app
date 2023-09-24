import { Inject, Injectable } from '@nestjs/common';
import { DB, DbType } from '../global/providers/db.provider';
import { USERS } from '../schema';
import { AddUserRequest } from './types';
import { eq, or } from 'drizzle-orm';
import _ from 'lodash';
import { badRequest, notFound } from '../utils/exceptions.utils';
import { hashSync } from 'bcrypt';
import { MarketAssignmentRequest } from '../market/types';
import { MARKETS } from '../schema';
import { toUserResponse } from '../utils/mappers';

@Injectable()
export class UserService {
  constructor(@Inject(DB) private db: DbType) {}

  async getAll() {
    return (
      await this.db
        .select()
        .from(USERS)
        .leftJoin(MARKETS, eq(USERS.market, MARKETS.code))
    ).map(({ app_users: user, markets }) => toUserResponse(user, markets));
  }

  async add(addUserRequest: AddUserRequest) {
    const users = await this.db
      .select()
      .from(USERS)
      .where(
        or(
          eq(USERS.email, addUserRequest.email),
          eq(USERS.username, addUserRequest.username),
        ),
      );
    if (!_.isEmpty(users)) {
      const { email, username } = addUserRequest;
      let message = '';
      if (users.some((user) => user.email === email)) {
        message = 'Email';
      }
      if (users.some((user) => user.username === username)) {
        if (!_.isEmpty(message)) message += ' and ';
        message += 'Username';
      }
      message += ' already in use';
      throw badRequest(message);
    }

    const user = await this.db
      .insert(USERS)
      .values({
        ...addUserRequest,
        password: hashSync(addUserRequest.password, 10),
      })
      .returning();

    delete user[0].password;

    return { user: user[0] };
  }

  async assignMarket({ userId, marketCode }: MarketAssignmentRequest) {
    const markets = await this.db
      .select()
      .from(MARKETS)
      .where(eq(MARKETS.code, marketCode));
    if (_.isEmpty(markets)) {
      throw notFound(`Market ${marketCode} not found`);
    }

    const update = await this.db
      .update(USERS)
      .set({ market: markets[0].code })
      .where(eq(USERS.id, userId))
      .returning();
    if (_.isEmpty(update)) {
      throw notFound('User not found');
    }

    return { user: toUserResponse(update[0], markets[0]) };
  }
}

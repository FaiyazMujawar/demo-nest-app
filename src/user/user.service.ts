import { Inject, Injectable } from '@nestjs/common';
import { hashSync } from 'bcrypt';
import { eq, inArray, or } from 'drizzle-orm';
import { entries, isEmpty, isNil, keys } from 'lodash';
import { ClsService } from 'nestjs-cls';
import { DB, DbType } from '../global/providers/db.provider';
import { MarketAssignmentRequest } from '../market/types';
import { MARKETS, USERS, USER_MARKET } from '../schema';
import { badRequest, notFound } from '../utils/exceptions.utils';
import { AddUserRequest } from './types';

@Injectable()
export class UserService {
  constructor(
    @Inject(DB) private db: DbType,
    private context: ClsService,
  ) {}

  async getAll() {
    const currentUser = this.context.get<Express.UserEntity>('user');
    const currentMarket = this.context.get<number>('market');

    return await this.db.query.USERS.findMany({
      with: {
        markets: {
          where: currentUser.superadmin
            ? null
            : eq(USER_MARKET.marketCode, currentMarket),
          columns: {
            role: true,
          },
          with: {
            market: {
              columns: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });
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
    if (!isEmpty(users)) {
      const { email, username } = addUserRequest;
      let message = '';
      if (users.some((user) => user.email === email)) {
        message = 'Email';
      }
      if (users.some((user) => user.username === username)) {
        if (!isEmpty(message)) message += ' and ';
        message += 'Username';
      }
      message += ' already in use';
      throw badRequest(message);
    }

    const marketCodes = keys(addUserRequest.markets).map((market) =>
      parseInt(market),
    );

    const markets = await this.db.query.MARKETS.findMany({
      where: inArray(MARKETS.code, marketCodes),
    });
    if (marketCodes.length !== markets.length) {
      throw notFound('One or more markets not found');
    }

    const user = await this.db
      .insert(USERS)
      .values({
        ...addUserRequest,
        password: hashSync(addUserRequest.password, 10),
      })
      .returning();

    await this.db.insert(USER_MARKET).values(
      entries(addUserRequest.markets).map(({ '0': marketCode, '1': role }) => ({
        marketCode: parseInt(marketCode),
        userId: user[0].id,
        role,
      })),
    );

    delete user[0].password;

    return { user: user[0] };
  }

  async assignMarket({ userId, markets }: MarketAssignmentRequest) {
    const user = await this.db.query.USERS.findFirst({
      where: eq(USERS.id, userId),
    });
    if (isNil(user)) {
      throw notFound(`User ${userId} not found`);
    }
    const marketCodes = keys(markets).map((market) => parseInt(market));
    const marketsInDb = await this.db
      .select()
      .from(MARKETS)
      .where(inArray(MARKETS.code, marketCodes));
    if (marketCodes.length !== marketsInDb.length) {
      throw notFound('One or more markets not found');
    }
    await this.db.delete(USER_MARKET).where(eq(USER_MARKET.userId, userId));
    await this.db
      .insert(USER_MARKET)
      .values(marketCodes.map((market) => ({ marketCode: market, userId })));
    return await this.db.query.USERS.findFirst({
      where: eq(USERS.id, userId),
      with: {
        markets: {
          columns: {
            role: true,
          },
          with: {
            market: {
              columns: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}

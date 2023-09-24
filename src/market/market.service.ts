import { Inject, Injectable } from '@nestjs/common';
import { DB, DbType } from '../global/providers/db.provider';
import { MARKETS } from '../schema';
import { MarketRequest } from './types';
import { eq } from 'drizzle-orm';
import { badRequest, notFound } from '../utils/exceptions.utils';
import _ from 'lodash';

@Injectable()
export class MarketService {
  constructor(@Inject(DB) private db: DbType) {}

  async getAll() {
    return await this.db.select().from(MARKETS);
  }

  async create(marketRequest: MarketRequest) {
    const market = await this.db
      .select()
      .from(MARKETS)
      .where(eq(MARKETS.code, marketRequest.code));
    if (!_.isEmpty(market)) {
      throw badRequest(
        `Market with code {${marketRequest.code}} already exists`,
      );
    }
    return await this.db.insert(MARKETS).values(marketRequest).returning();
  }

  async getByCode(code: number) {
    const market = await this.db
      .select()
      .from(MARKETS)
      .where(eq(MARKETS.code, code));
    if (_.isEmpty(market)) {
      throw notFound(`Market ${code} not found`);
    }
    return market[0];
  }
}

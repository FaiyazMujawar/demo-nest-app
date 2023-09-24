import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { notFound, unauthorized } from '../../utils/exceptions.utils';
import { DB, DbType } from '../../global/providers/db.provider';
import { TokenService } from '../../token/token.service';
import { USERS } from '../../schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class LoadUserMiddleware implements NestMiddleware {
  constructor(
    @Inject(DB) private db: DbType,
    private tokenService: TokenService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (_.isNil(authHeader) || !authHeader.startsWith('Bearer ')) {
      next(unauthorized('Token is required'));
      return;
    }
    const token = authHeader.substring(7);
    if (!this.tokenService.verifyToken(token)) {
      next(unauthorized('Token is invalid or expired'));
      return;
    }
    const uid = this.tokenService.getClaim<string>(token, 'uid');

    const users = await this.db
      .selectDistinct()
      .from(USERS)
      .where(eq(USERS.id, uid));
    if (_.isEmpty(users)) {
      next(notFound('User not found'));
      return;
    }
    const { id, role, market } = users[0];
    req.user = { id, role, market };
    next();
  }
}

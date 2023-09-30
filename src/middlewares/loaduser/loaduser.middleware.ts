import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import _, { isNil } from 'lodash';
import { DB, DbType } from '../../global/providers/db.provider';
import { USERS } from '../../schema';
import { TokenService } from '../../token/token.service';
import { notFound, unauthorized } from '../../utils/exceptions.utils';

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

    const user = await this.db.query.USERS.findFirst({
      where: eq(USERS.id, uid),
      with: {
        markets: {
          columns: {
            role: true,
          },
          with: {
            market: {
              columns: {
                code: true,
              },
            },
          },
        },
      },
    });
    if (isNil(user)) {
      next(notFound('User not found'));
    }
    req.user = {
      id: user.id,
      username: user.username,
      superadmin: user.superadmin,
      markets: user.markets.map(({ role, market: { code } }) => ({
        [code]: role,
      })),
    };
    next();
  }
}

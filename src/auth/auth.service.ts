import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compareSync } from 'bcrypt';
import { eq } from 'drizzle-orm';
import _, { isNil } from 'lodash';
import { DB, DbType } from '../global/providers/db.provider';
import { USERS } from '../schema';
import { TokenService } from '../token/token.service';
import { forbidden, notFound } from '../utils/exceptions.utils';
import { LoginRequest } from './types';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private db: DbType,
    private tokenService: TokenService,
    private readonly config: ConfigService,
  ) {}

  async login(loginRequest: LoginRequest) {
    const user = await this.db.query.USERS.findFirst({
      where: eq(USERS.username, loginRequest.username),
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
      throw notFound(`User ${loginRequest.username} not found`);
    }
    if (!compareSync(loginRequest.password, user.password)) {
      throw forbidden('Password incorrect');
    }
    return this.getAccessTokens(user);
  }

  async refreshToken(authHeader: string | undefined) {
    if (_.isNull(authHeader) || !authHeader.startsWith('Bearer ')) {
      throw forbidden('Token is required');
    }

    const token = authHeader.substring(7);
    const uid = this.tokenService.getClaim<string>(token, 'uid');
    const users = await this.db
      .selectDistinct()
      .from(USERS)
      .where(eq(USERS.id, uid));
    if (_.isEmpty(users)) {
      throw notFound('User not found');
    }

    return this.getAccessTokens(users[0]);
  }

  private getAccessTokens(user: any) {
    const token = this.tokenService.generateToken(
      {
        uid: user.id,
        markets: user.markets.map(({ market, role }) => ({
          role,
          market: market.role,
        })),
      },
      this.config.get<string | number>('TOKEN_EXPIRATION'),
    );
    const refreshToken = this.tokenService.generateToken(
      {
        uid: user.id,
      },
      this.config.get<string | number | undefined>('REFRESH_TOKEN_EXPIRATION'),
    );
    return {
      token,
      refreshToken,
    };
  }
}

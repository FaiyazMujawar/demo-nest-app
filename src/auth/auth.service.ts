import { Inject, Injectable } from '@nestjs/common';
import { DB, DbType } from '../global/providers/db.provider';
import { LoginRequest } from './types';
import { users, User } from '../schema';
import { eq } from 'drizzle-orm';
import _ from 'lodash';
import { compareSync } from 'bcrypt';
import { forbidden, notFound } from '../utils/exceptions.utils';
import { TokenService } from '../token/token.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private db: DbType,
    private tokenService: TokenService,
    private readonly config: ConfigService,
  ) {}

  async login(loginRequest: LoginRequest) {
    const usersInDb = await this.db
      .select()
      .from(users)
      .where(eq(users.username, loginRequest.username));

    if (_.isEmpty(usersInDb)) {
      throw notFound(`User ${loginRequest.username} not found`);
    }
    const user = usersInDb[0];
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
    const usersInDb = await this.db
      .selectDistinct()
      .from(users)
      .where(eq(users.id, uid));
    if (_.isEmpty(usersInDb)) {
      throw notFound('User not found');
    }

    return this.getAccessTokens(usersInDb[0]);
  }

  private getAccessTokens(user: User) {
    const token = this.tokenService.generateToken(
      {
        uid: user.id,
        role: user.role,
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

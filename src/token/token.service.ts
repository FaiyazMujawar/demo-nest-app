import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { decode, sign, verify } from 'jsonwebtoken';
import * as _ from 'lodash';

@Injectable()
export class TokenService {
  constructor(private readonly config: ConfigService) {}

  generateToken(
    payload: any,
    expiration: string | number | undefined = undefined,
  ): string {
    return sign(payload, this.config.get<string>('TOKEN_SECRET'), {
      expiresIn: expiration,
    });
  }

  verifyToken(token: string): boolean {
    return !_.isNil(verify(token, this.config.get<string>('TOKEN_SECRET')));
  }

  decodeToken(token: string): any {
    return decode(token);
  }

  getClaim<T>(token: string, claim: string): T | undefined {
    const payload = this.decodeToken(token);
    return payload[claim] as T;
  }
}

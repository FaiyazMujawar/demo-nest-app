import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenService } from '../token/token.service';

@Module({
  providers: [AuthService, TokenService],
})
export class AuthModule {}

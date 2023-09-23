import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest } from './types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginRequest: LoginRequest) {
    return await this.authService.login(loginRequest);
  }

  @Post('refresh-token')
  async refreshToken(@Headers('Authorization') auth: string) {
    return await this.authService.refreshToken(auth);
  }
}

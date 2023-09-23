import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalModule } from './global/global.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { TokenModule } from './token/token.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { TokenService } from './token/token.service';
import { LoadUserMiddleware as loadUser } from './middlewares/loaduser/loaduser.middleware';

@Module({
  imports: [
    GlobalModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    TokenModule,
    AuthModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, TokenService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(loadUser)
      .exclude('auth/(.*)')
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

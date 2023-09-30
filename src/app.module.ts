import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Request, Response } from 'express';
import { ClsModule } from 'nestjs-cls';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { GlobalModule } from './global/global.module';
import { MarketModule } from './market/market.module';
import { LoadUserMiddleware as loadUser } from './middlewares/loaduser/loaduser.middleware';
import { ProductModule } from './product/product.module';
import { TokenModule } from './token/token.module';
import { TokenService } from './token/token.service';
import { UploadsModule } from './uploads/uploads.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    GlobalModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    TokenModule,
    AuthModule,
    MarketModule,
    ProductModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        setup: (context, req: Request, __: Response) => {
          context.set('user', req.user);
          const market = req.headers['market'] as string;
          context.set(
            'market',
            /\d+/.test(market) ? parseInt(market) : undefined,
          );
        },
      },
    }),
    UploadsModule,
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

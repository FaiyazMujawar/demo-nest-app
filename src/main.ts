import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionHandler } from './utils/ExceptionHandler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ExceptionHandler());
  await app.listen(3000);
}
bootstrap();

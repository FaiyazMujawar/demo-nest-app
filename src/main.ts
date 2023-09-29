import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionHandler } from './utils/ExceptionHandler';
import { rmSync, mkdirSync, existsSync } from 'fs';

const TEMPLATE_DIRECTORY = 'templates';

function setup() {
  if (existsSync(TEMPLATE_DIRECTORY)) {
    rmSync(TEMPLATE_DIRECTORY, { recursive: true });
  }
  mkdirSync(TEMPLATE_DIRECTORY);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setup();
  app.useGlobalFilters(new ExceptionHandler());
  await app.listen(3000);
}
bootstrap();

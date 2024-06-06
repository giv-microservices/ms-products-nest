import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { env } from './config';

async function bootstrap() {
  const logger = new Logger('Product-ms-main');

  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  await app.listen(env.port);
  logger.log(`Server running on http://localhost:${env.port} 🚀`);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. Helmet Security Headers
  app.use(helmet());
  app.use(json({ limit: '10mb' }));
  
  // 2. Strict CORS (Hardcoded to bypass env issues)
  app.enableCors({
    origin: ['https://aprovapetro.vercel.app', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. Global Validation Pipe to strip malicious/extra data
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

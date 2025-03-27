import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from "node:process";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.use(
        rateLimit({
            windowMs: 15 * 60 * 1000,
            limit: 100,
            message: 'Too many requests from this IP, please try again after 15 minutes',
        }),
      );
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:19006',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
  });
}

bootstrap();
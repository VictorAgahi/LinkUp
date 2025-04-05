import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport} from '@nestjs/microservices';
import { AUTH, AUTH_PACKAGE_NAME, AUTH_PORT } from '@app/common';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../auth.proto'),
        package: AUTH_PACKAGE_NAME,
        url: AUTH_PORT,
      },
    }
  );
  await app.listen();
}
bootstrap();


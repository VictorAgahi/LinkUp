import { NestFactory } from '@nestjs/core';
import { DatabaseModule } from './database.module';
import { MicroserviceOptions, Transport} from '@nestjs/microservices';
import { DATABASE_PACKAGE_NAME, DATABASE_PORT } from '@app/common';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    DatabaseModule,
    {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../database.proto'),
        package: DATABASE_PACKAGE_NAME,
        url: DATABASE_PORT,
      },
    }
  );
  await app.listen();
}
bootstrap();


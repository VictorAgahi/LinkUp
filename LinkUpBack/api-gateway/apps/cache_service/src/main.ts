import { NestFactory } from '@nestjs/core';

import { MicroserviceOptions, Transport} from '@nestjs/microservices';

import { join } from 'path';
import { CacheModule } from './cache.module';
import { CACHE_PACKAGE_NAME, CACHE_PORT } from '@app/common';


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CacheModule,
    {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../cache.proto'),
        package: CACHE_PACKAGE_NAME,
        url: CACHE_PORT,
      },
    }
  );
  await app.listen();
}
bootstrap();


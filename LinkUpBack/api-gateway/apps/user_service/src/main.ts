import { NestFactory } from '@nestjs/core';

import { MicroserviceOptions, Transport} from '@nestjs/microservices';

import { join } from 'path';
import { UserModule } from './user.module';
import { USER_PORT } from '@app/common';
import { USER_PACKAGE_NAME } from '@app/common/types/user';


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserModule,
    {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../user.proto'),
        package: USER_PACKAGE_NAME,
        url: USER_PORT,
      },
    }
  );
  await app.listen();
}
bootstrap();


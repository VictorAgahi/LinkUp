import { NestFactory } from '@nestjs/core';
import { Crypto_ServiceModule } from './crypto_service.module';
import { MicroserviceOptions, Transport} from '@nestjs/microservices';
import { CRYPTO, CRYPTO_PACKAGE_NAME, CRYPTO_PORT } from '@app/common';
import { join } from 'path';


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    Crypto_ServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../crypto.proto'),
        package: CRYPTO_PACKAGE_NAME,
        url: CRYPTO_PORT,
      },
    }
  );
  await app.listen();
}
bootstrap();


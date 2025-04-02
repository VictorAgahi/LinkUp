import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE, CRYPTO_SERVICE } from './constants';
import { AUTH_PACKAGE_NAME, CRYPTO_PACKAGE_NAME } from '@app/common';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: AUTH_PACKAGE_NAME,
          protoPath: join(process.cwd(), 'proto/auth.proto'),
          url: 'localhost:5004',  
        },
      },
      {
        name: CRYPTO_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: CRYPTO_PACKAGE_NAME,
          protoPath: join(process.cwd(), 'proto/crypto.proto'),
          url: 'localhost:5000',  
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
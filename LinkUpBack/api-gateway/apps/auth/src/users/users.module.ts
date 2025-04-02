import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CRYPTO, CRYPTO_PACKAGE_NAME } from '@app/common';
import { join } from 'path';
@Module({
  imports: [
      ClientsModule.register([
        {
          name: CRYPTO,
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

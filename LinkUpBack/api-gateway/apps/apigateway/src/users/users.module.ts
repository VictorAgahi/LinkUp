import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Client, ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVCE } from './constants';
import { AUTH_PACKAGE_NAME } from '@app/common';
import { join } from 'path'


@Module({
  imports:[
    ClientsModule.register([
      {
        name: AUTH_SERVCE,
        transport: Transport.GRPC,
        options: {  
          package: AUTH_PACKAGE_NAME,
          protoPath: join(process.cwd(), 'proto/auth.proto'),
        },
      }
  ])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

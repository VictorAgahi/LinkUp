import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClientsModule } from '@nestjs/microservices';
import {CACHE_SERVICE, DATABASE_SERVICE} from './utils/constants'
import { CACHE_PACKAGE_NAME, CACHE_PORT, DATABASE_PACKAGE_NAME, DATABASE_PORT } from '@app/common';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
@Module({
  imports: [ 
    ClientsModule.register([
          {
            name: DATABASE_SERVICE,
            transport: Transport.GRPC,
            options: {
              package: DATABASE_PACKAGE_NAME,
              protoPath: join(process.cwd(), 'proto/database.proto'),
              url: DATABASE_PORT,   
            },
          },
          {
            name: CACHE_SERVICE,
            transport: Transport.GRPC,
            options: {
              package: CACHE_PACKAGE_NAME,
              protoPath: join(process.cwd(), 'proto/cache.proto'),
              url: CACHE_PORT,   
            },
          },
        ]),],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

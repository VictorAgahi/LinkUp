import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Module } from "@nestjs/common";
import { ClientsModule } from "@nestjs/microservices";
import { Transport } from "@nestjs/microservices";
import { AUTH_SERVICE } from "../utils/constants";
import { AUTH_PACKAGE_NAME, AUTH_PORT } from "@app/common";
import { join } from "path";
@Module({
  imports: [
    ClientsModule.register([
        {
          name: AUTH_SERVICE,
          transport: Transport.GRPC,
          options: {
            package: AUTH_PACKAGE_NAME,
            protoPath: join(process.cwd(), 'proto/auth.proto'),
            url: AUTH_PORT,  
          },
        },
      ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [],
})
export default class AuthModule {};
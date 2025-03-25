import { Module } from '@nestjs/common';
import { RedisModule } from "./common/redis/redis.module";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "./common/prisma/prisma.module";

@Module({
  imports: [
    UserModule,
    RedisModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
import { Module } from '@nestjs/common';
import { RedisModule } from "./common/redis/redis.module";
import { PrismaModule } from "./common/prisma/prisma.module";
import {Neo4jModule} from "./common/neo4j/neo4j.module";
import {AuthModule} from "./auth/auth.module";
import {CryptoModule} from "./common/crypto/crypto.module";

@Module({
  imports: [
    AuthModule,
    RedisModule,
    PrismaModule,
    Neo4jModule,
    CryptoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
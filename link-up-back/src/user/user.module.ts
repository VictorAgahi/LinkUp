import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RedisService } from '../common/redis/redis.service';
import {PrismaService} from "../common/prisma/prisma.service";

@Module({
    controllers: [UserController],
    providers: [UserService, RedisService, PrismaService],
    exports: [UserService],
})
export class UserModule {}
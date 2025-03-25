import { Injectable } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';
import { UserEntity } from './user.entity';
import {PrismaService} from "../common/prisma/prisma.service";


@Injectable()
export class UserService {
    constructor(private readonly redisService: RedisService, private prisma: PrismaService) {
    }
    async cacheUser(user: UserEntity) {
        const key = `user:${user.id}`;
        await this.redisService.setValue(key, JSON.stringify(user), 20);
    }

    async getUser(id: string) {
        const key = `user:${id}`;
        const user = await this.redisService.getValue(key);
        return user ? JSON.parse(user) : null;
    }

    async createUser(
        firstName: string,
        lastName: string,
        username: string,
        email: string,
        password: string,
    ): Promise<UserEntity> {
        const user = await this.prisma.user.create({
            data: {
                firstName,
                lastName,
                username,
                email,
                password,
            },
        });

        return new UserEntity(
            user.id,
            user.firstName,
            user.lastName,
            user.username,
            user.email,
            user.password,
            user.createdAt,
            user.updatedAt,
        );
    }

    async getUserById(id: number): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) return null;

        return new UserEntity(
            user.id,
            user.firstName,
            user.lastName,
            user.username,
            user.email,
            user.password,
            user.createdAt,
            user.updatedAt,
        );
    }

    async getUserByEmail(email: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) return null;

        return new UserEntity(
            user.id,
            user.firstName,
            user.lastName,
            user.username,
            user.email,
            user.password,
            user.createdAt,
            user.updatedAt,
        );
    }

}
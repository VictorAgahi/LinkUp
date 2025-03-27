import {Injectable, Logger, OnModuleInit} from "@nestjs/common";
import {PrismaService} from "../common/prisma/prisma.service";
import {Neo4jService} from "../common/neo4j/neo4j.service";
import {RedisService} from "../common/redis/redis.service";
import {CryptoService} from "../common/crypto/crypto.service";
import {AccessTokenDto} from "./dto/accessToken.dto";
@Injectable()
export default class UserService implements OnModuleInit
{
    private readonly logger = new Logger(UserService.name);

    constructor(
        private prisma: PrismaService,
        private neo4j: Neo4jService,
        private redis: RedisService,
        private crypto: CryptoService)
    {}

    onModuleInit() {
        this.checkEnvVariables();
    }

    private checkEnvVariables() {
            const requiredEnv = [
                'JWT_ACCESS_SECRET',
                'JWT_REFRESH_SECRET',
                'ENCRYPTION_KEY',
            ];
            const missingEnv = requiredEnv.filter((key) => !process.env[key]);

            if (missingEnv.length > 0) {
                const errorMessage = `Missing environment variables: ${missingEnv.join(', ')}`;
                this.logger.error(errorMessage);
                throw new Error(errorMessage);
            }
    }

    async me(dto: AccessTokenDto) {

    }
}
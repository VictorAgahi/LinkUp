import { WebSocketGateway as NestWebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../../user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAccessStrategy } from '../../config/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { Inject, Logger } from '@nestjs/common';

@NestWebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_ORIGIN,
    },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    private readonly logger = new Logger(WebSocketGateway.name);

    constructor(
        private userService: UserService,
        @Inject(JwtAccessStrategy) private jwtAccessStrategy: JwtAccessStrategy
    ) {}

    async handleConnection(client: Socket) {
        try {
            this.logger.log(`Client ${client.id} is trying to connect`);

            const authHeader = client.handshake.headers.authorization || client.handshake.auth.token;
            const token = authHeader?.split(' ')[1];

            if (!token) {
                throw new UnauthorizedException('Missing token');
            }

            const jwtService = new JwtService({
                secret: process.env.JWT_ACCESS_SECRET,
                verifyOptions: { algorithms: ['HS256'] }
            });

            const decoded = jwtService.verify(token);
            const userId = decoded.sub;

            if (!userId) {
                throw new UnauthorizedException('Invalid token structure');
            }

            const payload = await this.jwtAccessStrategy.validate({ sub: userId });

            if (!payload || !payload.userId) {
                this.logger.warn(`Client ${client.id} has an invalid token or no userId in payload`);
                throw new UnauthorizedException('Invalid token');
            }


            await this.userService.addConnectedUser(payload.userId, client.id);
            this.logger.log(`User ${payload.userId} connected successfully with socket ID ${client.id}`);

            this.server.emit('users:online', this.userService.getConnectedUsers());
            this.logger.log(`Updated online users list`);

        } catch (error) {
            this.logger.error(`Error during connection for client ${client.id}: ${error.message}`, error.stack);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client ${client.id} disconnected`);

        this.userService.removeConnectedUser(client.id);
        this.server.emit('users:online', this.userService.getConnectedUsers());
        this.logger.log(`Updated online users list after disconnection`);
    }
}
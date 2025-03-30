import {
    WebSocketGateway as NestWebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../../user/user.service';
import { UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@NestWebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_ORIGIN,
    },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    readonly logger = new Logger(WebSocketGateway.name);

    constructor(private userService: UserService, private jwtService: JwtService) {}

    async handleConnection(client: Socket) {
        this.logger.log(`Client ${client.id} is trying to connect`);
        const authHeader = client.handshake.headers.authorization || client.handshake.auth?.token;
        if (!authHeader) {
            this.logger.error(`Missing token for client ${client.id}`);
            client.disconnect();
            return;
        }
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            this.logger.error(`Invalid token format for client ${client.id}`);
            client.disconnect();
            return;
        }
        const token = parts[1];
        let decoded;
        try {
            const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
            if (!secret) throw new Error('Missing JWT secret');
            decoded = this.jwtService.verify(token, { secret, algorithms: ['HS256'] });
        } catch (error) {
            this.logger.error(`Error verifying token for client ${client.id}: ${error.message}`);
            client.disconnect();
            return;
        }
        const userId = decoded.sub;
        if (!userId) {
            this.logger.error(`Invalid token structure for client ${client.id}`);
            client.disconnect();
            return;
        }
        try {
            await this.userService.addConnectedUser(userId, client.id);
            const connectedUsers = this.userService.getConnectedUsers();
            this.server.emit('users:online', connectedUsers);
            this.logger.log(`User ${userId} connected successfully with socket ID ${client.id}`);
            this.logger.log('Updated online users list');
        } catch (error) {
            this.logger.error(`Error during connection for client ${client.id}: ${error.message}`, error.stack);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client ${client.id} disconnected`);
        this.userService.removeConnectedUser(client.id);
        const connectedUsers = this.userService.getConnectedUsers();
        this.server.emit('users:online', connectedUsers);
        this.logger.log('Updated online users list after disconnection');
    }
}

import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketGateway } from './websocket.gateway';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

describe('WebSocketGateway', () => {
    let gateway: WebSocketGateway;
    let userService: UserService;
    let jwtService: JwtService;

    const mockSocket = {
        id: 'test-socket-id',
        handshake: { headers: {}, auth: {} },
        disconnect: jest.fn(),
    } as unknown as Socket;

    const mockServer = {
        emit: jest.fn(),
    } as unknown as Server;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WebSocketGateway,
                {
                    provide: UserService,
                    useValue: {
                        addConnectedUser: jest.fn(),
                        removeConnectedUser: jest.fn(),
                        // Par défaut, pour certains tests, getConnectedUsers retourne [].
                        getConnectedUsers: jest.fn().mockReturnValue([]),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn(),
                    },
                },
            ],
        }).compile();

        gateway = module.get<WebSocketGateway>(WebSocketGateway);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
        // Pour éviter que les logs n'affectent pas nos tests
        jest.spyOn(gateway.logger, 'error').mockImplementation(() => {});
        jest.spyOn(gateway.logger, 'warn').mockImplementation(() => {});
        jest.spyOn(gateway.logger, 'log').mockImplementation(() => {});
        gateway.server = mockServer;
        // Assurer la présence du secret dans l'environnement de test
        process.env.JWT_ACCESS_TOKEN_SECRET = 'test-secret';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('handleConnection', () => {
        it('should authenticate and add user on valid token', async () => {
            const validToken = 'valid-token';
            mockSocket.handshake.headers.authorization = `Bearer ${validToken}`;
            // Simuler une vérification réussie
            (jwtService.verify as jest.Mock).mockReturnValue({ sub: 'user-id' });
            (userService.addConnectedUser as jest.Mock).mockResolvedValue(undefined);
            (userService.getConnectedUsers as jest.Mock).mockReturnValue([]); // pour correspondre à l'attente

            await gateway.handleConnection(mockSocket);

            expect(jwtService.verify).toHaveBeenCalledWith(validToken, {
                secret: process.env.JWT_ACCESS_TOKEN_SECRET,
                algorithms: ['HS256'],
            });
            expect(userService.addConnectedUser).toHaveBeenCalledWith('user-id', mockSocket.id);
            expect(mockServer.emit).toHaveBeenCalledWith('users:online', []);
        });

        it('should disconnect if token is missing', async () => {
            mockSocket.handshake.headers.authorization = undefined;
            await gateway.handleConnection(mockSocket);
            expect(mockSocket.disconnect).toHaveBeenCalled();
        });

        it('should disconnect if token format is invalid', async () => {
            mockSocket.handshake.headers.authorization = 'InvalidFormatToken';
            await gateway.handleConnection(mockSocket);
            expect(mockSocket.disconnect).toHaveBeenCalled();
        });

        it('should disconnect if jwtService.verify throws error', async () => {
            const invalidToken = 'invalid-token';
            mockSocket.handshake.headers.authorization = `Bearer ${invalidToken}`;
            (jwtService.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });
            await gateway.handleConnection(mockSocket);
            expect(mockSocket.disconnect).toHaveBeenCalled();
        });

        it('should disconnect if decoded token has no sub', async () => {
            const tokenWithoutSub = 'no-sub-token';
            mockSocket.handshake.headers.authorization = `Bearer ${tokenWithoutSub}`;
            (jwtService.verify as jest.Mock).mockReturnValue({}); // pas de sub
            await gateway.handleConnection(mockSocket);
            expect(mockSocket.disconnect).toHaveBeenCalled();
        });
    });

    describe('handleDisconnect', () => {
        it('should remove user and emit updated list', () => {
            (userService.getConnectedUsers as jest.Mock).mockReturnValue([]);
            gateway.handleDisconnect(mockSocket);
            expect(userService.removeConnectedUser).toHaveBeenCalledWith(mockSocket.id);
            expect(mockServer.emit).toHaveBeenCalledWith('users:online', []);
        });

        it('should emit updated list with users when getConnectedUsers returns non-empty', () => {
            const users = [{ id: 'user-id', firstName: 'Test', lastName: 'User' }];
            (userService.getConnectedUsers as jest.Mock).mockReturnValue(users);
            gateway.handleDisconnect(mockSocket);
            expect(userService.removeConnectedUser).toHaveBeenCalledWith(mockSocket.id);
            expect(mockServer.emit).toHaveBeenCalledWith('users:online', users);
        });
    });
});

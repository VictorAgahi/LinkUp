import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

jest.mock('./auth.service');

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [AuthService],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        it('should successfully register a user', async () => {
            const dto: RegisterDto = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password',
                firstName:"test",
                lastName:"test2"
            };
            const result = { accessToken: 'accessToken', refreshToken: 'refreshToken' };

            jest.spyOn(authService, 'register').mockResolvedValue(result);

            expect(await controller.register(dto)).toEqual(result);
        });
    });

    describe('login', () => {
        it('should successfully log in a user', async () => {
            const dto: LoginDto = {
                email: 'test@example.com',
                password: 'password'
            };
            const result = { accessToken: 'accessToken', refreshToken: 'refreshToken' };
            jest.spyOn(authService, 'login').mockResolvedValue(result);
            expect(await controller.login(dto)).toEqual(result);
        });
    });

    describe('refreshToken', () => {
        it('should successfully refresh the token', async () => {
            const dto: RefreshTokenDto = { refreshToken: 'validRefreshToken' };
            const result = { accessToken: 'accessToken' };

            jest.spyOn(authService, 'refreshToken').mockResolvedValue(result);

            expect(await controller.refreshToken(dto)).toEqual(result);
        });
    });
});
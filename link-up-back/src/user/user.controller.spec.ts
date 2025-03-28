import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RequestAccessTokenDto } from './dto/request.accessToken.dto';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

// Mock du AuthGuard pour ignorer l'authentification
jest.mock('@nestjs/passport', () => ({
    AuthGuard: jest.fn().mockImplementation(() => ({
        canActivate: jest.fn().mockReturnValue(true),
    })),
}));

describe('UserController', () => {
    let controller: UserController;
    let userService: UserService;

    beforeEach(async () => {
        const mockUserService = {
            info: jest.fn().mockResolvedValue({
                firstName: 'John',
                lastName: 'Doe',
                username: 'johndoe',
            }),
            updateUser: jest.fn().mockResolvedValue({
                firstName: 'Updated',
                lastName: 'Doe',
                username: 'updateduser',
            }),
            deleteUser: jest.fn().mockResolvedValue({ message: 'User deleted successfully' }),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [{ provide: UserService, useValue: mockUserService }],
        }).compile();

        controller = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('info', () => {
        it('should return user info', async () => {
            const dto: RequestAccessTokenDto = { userId: '123', username: 'johndoe' };
            expect(await controller.info(dto)).toEqual({
                firstName: 'John',
                lastName: 'Doe',
                username: 'johndoe',
            });
        });
    });

    describe('updateUser', () => {
        it('should update user information', async () => {
            const dto: RequestAccessTokenDto = { userId: '123', username: 'johndoe' };
            const updateData = { firstName: 'Updated', username: 'updateduser' };

            expect(await controller.updateUser(dto, updateData)).toEqual({
                firstName: 'Updated',
                lastName: 'Doe',
                username: 'updateduser',
            });
        });
    });

    describe('deleteUser', () => {
        it('should delete user', async () => {
            const dto: RequestAccessTokenDto = { userId: '123', username: 'johndoe' };

            expect(await controller.deleteUser(dto)).toEqual({ message: 'User deleted successfully' });
        });
    });
});
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

class MockAuthGuard {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        req.user = { userId: '123', username: 'johndoe' };
        return true;
    }
}

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
        })
            .overrideGuard(AuthGuard('jwt-access')) // Remplace l'AuthGuard par un mock
            .useValue(new MockAuthGuard())
            .compile();

        controller = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('info', () => {
        it('should return user info', async () => {
            const req = { user: { userId: '123', username: 'johndoe' } };

            await expect(controller.info(req)).resolves.toEqual({
                firstName: 'John',
                lastName: 'Doe',
                username: 'johndoe',
            });

            expect(userService.info).toHaveBeenCalledWith({
                userId: '123',
            });
        });
    });

    describe('updateUser', () => {
        it('should update user information', async () => {
            const req = { user: { userId: '123', username: 'johndoe' } };
            const updateData = { firstName: 'Updated', username: 'updateduser' };

            await expect(controller.updateUser(req, updateData)).resolves.toEqual({
                firstName: 'Updated',
                lastName: 'Doe',
                username: 'updateduser',
            });

            expect(userService.updateUser).toHaveBeenCalledWith(
                { userId: '123' },
                updateData
            );
        });
    });

    describe('deleteUser', () => {
        it('should delete user', async () => {
            const req = { user: { userId: '123', username: 'johndoe' } };

            await expect(controller.deleteUser(req)).resolves.toEqual({
                message: 'User deleted successfully',
            });

            expect(userService.deleteUser).toHaveBeenCalledWith({
                userId: '123',
            });
        });
    });
});

import { Controller, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  UsersServiceController,
  UsersServiceControllerMethods,
  CreateUserRequest,
  UserResponse,
  GetUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  GetAllUsersRequest,
  GetAllUsersResponse,
} from '@app/common';
import { Observable, of, from } from 'rxjs';


@Controller()
@UsersServiceControllerMethods()
export class UsersController implements UsersServiceController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  async createUser(request: CreateUserRequest): Promise<UserResponse> {
    this.logger.log(`Received createUser request: ${JSON.stringify(request)}`);
    return this.usersService.create(request);
  }

  async getUser(request: GetUserRequest): Promise<UserResponse> {
    this.logger.log(`Received getUser request with ID: ${request.id}`);
    return this.usersService.findOne(request.id);
  }

  async updateUser(request: UpdateUserRequest): Promise<UserResponse> {
    this.logger.log(`Received updateUser request: ${JSON.stringify(request)}`);
    return this.usersService.update(request);
  }

  async deleteUser(request: DeleteUserRequest): Promise<UserResponse> {
    this.logger.log(`Received deleteUser request with ID: ${request.id}`);
    return this.usersService.remove(request);
  }
  
  
getAllUsers(request: Observable<GetAllUsersRequest>): Observable<GetAllUsersResponse> {
  this.logger.log(`Received getAllUsers request`);

  return from(this.usersService.findAll().then(users => ({
    users: users.map(user => ({
      ...user,
      password:  '',
    })),
    total: users.length,
  })));
}
}
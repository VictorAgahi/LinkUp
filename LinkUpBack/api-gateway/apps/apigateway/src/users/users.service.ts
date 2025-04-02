import { Injectable, OnModuleInit } from '@nestjs/common';
import { 
  CreateUserRequest,
  GetUserRequest,
  DeleteUserRequest,
  GetAllUsersRequest, 
  UpdateUserRequest,  
  UsersServiceClient,
  USERS_SERVICE_NAME
} from '@app/common';
import { AUTH_SERVCE } from './constants';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersService implements OnModuleInit{
  private readonly logger = new Logger(UsersService.name);
  private userServices : UsersServiceClient;
  constructor(@Inject(AUTH_SERVCE) private client : ClientGrpc) {}
  onModuleInit() {
    this.userServices = this.client.getService<UsersServiceClient>(USERS_SERVICE_NAME);
  }

  create(req: CreateUserRequest) {
    this.logger.log(`Creating user: ${JSON.stringify(req)}`);
    return this.userServices.createUser(req);
  }

  getUser(req : GetUserRequest) {
    return this.userServices.getUser(req);
  }

  getAllUsers(req: GetAllUsersRequest) {
    this.logger.log(`Fetching users: Page ${req.page}, Limit ${req.limit}`);

    const startIndex = (req.page - 1) * req.limit;
    const paginatedUsers = 2; 

    return of({
      users: paginatedUsers,
      total: 2,
    });
  }

  update(req: UpdateUserRequest) {AUTH_SERVCE
    return this.userServices.updateUser(req);Injectable
  }

  delete(req: DeleteUserRequest) {
    return this.userServices.deleteUser(req);
  }
}

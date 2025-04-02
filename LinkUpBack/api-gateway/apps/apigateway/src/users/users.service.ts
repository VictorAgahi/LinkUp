import { Injectable, OnModuleInit } from '@nestjs/common';
import { 
  CreateUserRequest,
  GetUserRequest,
  DeleteUserRequest,
  GetAllUsersRequest, 
  UpdateUserRequest,  
  EncryptRequest,
  UsersServiceClient,
  EncryptResponse,
  USERS_SERVICE_NAME,
  CRYPTO_SERVICE_NAME
} from '@app/common';
import { AUTH_SERVICE, CRYPTO_SERVICE } from './constants';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { Logger } from '@nestjs/common';
import { CryptoServiceClient } from '@app/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit{
  private readonly logger = new Logger(UsersService.name);
  private userServices : UsersServiceClient;
  private cryptoService : CryptoServiceClient;
  constructor(
    @Inject(AUTH_SERVICE) private client : ClientGrpc, 
    @Inject(CRYPTO_SERVICE) private cryptoClient : ClientGrpc)
     {}
  onModuleInit() {
    this.userServices = this.client.getService<UsersServiceClient>(USERS_SERVICE_NAME);
    this.cryptoService = this.cryptoClient.getService<CryptoServiceClient>(CRYPTO_SERVICE_NAME);
  }


  async create(req: CreateUserRequest) {
    let encryptedEmail: string;
  
    const response = this.encrypt({ plaintext: req.email });
  
    if (response instanceof Observable) {
      const res = await lastValueFrom(response);
      encryptedEmail = res.ciphertext;
    } 
    else if (response instanceof Promise) {
      const res = await response;
      encryptedEmail = res.ciphertext;
    } 
    else
    {
      encryptedEmail = response.ciphertext;
    }
  
    this.logger.warn(`Encrypted email: ${encryptedEmail}`);
    req.email = encryptedEmail;
    this.logger.debug(`REQ Email --> ${req.email}`);
  
    return await this.userServices.createUser(req);
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

  update(req: UpdateUserRequest) {
    return this.userServices.updateUser(req);Injectable
  }

  delete(req: DeleteUserRequest) {
    return this.userServices.deleteUser(req);
  }

  encrypt(req: EncryptRequest) : EncryptResponse | Observable<EncryptResponse> | Promise<EncryptResponse> {
    this.logger.log(`Encrypting data: ${JSON.stringify(req)}`);
    return this.cryptoService.encrypt(req);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { 
  CreateUserRequest,
  GetUserRequest,
  DeleteUserRequest,
  GetAllUsersRequest, 
  UpdateUserRequest,
  EncryptRequest,  
} from '@app/common'; 
import { EncryptPipe } from '../pipes/encrypt.pipes';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService){}

  @Post()
  @UsePipes(EncryptPipe)
  create(@Body() req : CreateUserRequest ) {
    return this.userService.create(req);
  }

  @Get()
  findAll(@Body() req : GetAllUsersRequest) {
    return this.userService.getAllUsers(req);
  }

  @Get(':id')
  findOne(@Body() req : GetUserRequest) {
    return this.userService.getUser(req);
  }

  @Patch(':id')
  update(@Body() req: UpdateUserRequest) {
    return this.userService.update(req);
  }

  @Delete(':id')
  remove(@Body() req: DeleteUserRequest) {
    return this.userService.delete(req);
  }
  @Post('encrypt')
  encrypt(@Body() req:EncryptRequest) {
    return this.userService.encrypt(req);
  }
}

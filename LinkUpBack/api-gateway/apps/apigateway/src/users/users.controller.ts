import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { 
  CreateUserRequest,
  GetUserRequest,
  DeleteUserRequest,
  GetAllUsersRequest, 
  UpdateUserRequest,  
} from '@app/common'; 

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService){}

  @Post()
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
}

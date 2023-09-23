import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { AddUserRequest } from './types';

@Controller('users')
@UseGuards(AuthGuard)
@Roles(Role.ADMIN)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getAll() {
    return await this.userService.getAll();
  }

  @Post()
  async add(@Body() addUserRequest: AddUserRequest) {
    return await this.userService.add(addUserRequest);
  }

  // TODO: add functionality to allow users to update their account
}

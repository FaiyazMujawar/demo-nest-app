import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { AddUserRequest } from './types';
import { MarketAssignmentRequest } from '../market/types';

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

  @Put('assign-market')
  async assignMarket(@Body() request: MarketAssignmentRequest) {
    return await this.userService.assignMarket(request);
  }

  // TODO: add functionality to allow users to update their account
}

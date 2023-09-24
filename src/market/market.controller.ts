import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MarketService } from './market.service';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';
import { MarketRequest } from './types';

@Controller('markets')
@UseGuards(AuthGuard)
@Roles(Role.ADMIN)
export class MarketController {
  constructor(private marketService: MarketService) {}

  @Get()
  async getAll() {
    return await this.marketService.getAll();
  }

  @Get(':code')
  async getByCode(@Param('code') code: number) {
    return await this.marketService.getByCode(code);
  }

  @Post()
  async create(@Body() marketRequest: MarketRequest) {
    return await this.marketService.create(marketRequest);
  }
}

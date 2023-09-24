import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ProductService } from './product.service';
import { ProductRequest } from './types';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/role.enum';

@Controller('products')
@UseGuards(AuthGuard)
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  async getAll() {
    return await this.productService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.productService.getById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() productRequest: ProductRequest) {
    return await this.productService.create(productRequest);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() productRequest: Partial<ProductRequest>,
  ) {
    return await this.productService.update(id, productRequest);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    return await this.productService.delete(id);
  }
}

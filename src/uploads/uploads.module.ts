import { Module } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, ProductService],
})
export class UploadsModule {}

import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { Role } from '../roles/role.enum';
import { Roles } from '../roles/roles.decorator';
import { UploadsService } from './uploads.service';

@Controller('uploads')
@UseGuards(AuthGuard)
@Roles(Role.ADMIN)
export class UploadsController {
  constructor(private uploadService: UploadsService) {}

  @Get('template')
  async template(
    @Query('type') type: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.uploadService.generateTemplate(type, response);
  }

  @Get()
  async getAll() {
    return await this.uploadService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.uploadService.getById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async imports(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: string,
  ) {
    return await this.uploadService.importFile(type, file.buffer);
  }
}

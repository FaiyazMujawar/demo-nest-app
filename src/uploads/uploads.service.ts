import { Inject, Injectable, StreamableFile } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { isEmpty, isNil, kebabCase, upperCase } from 'lodash';
import { ClsService } from 'nestjs-cls';
import { join } from 'path';
import { DB, DbType } from '../global/providers/db.provider';
import { ProductService } from '../product/product.service';
import { UPLOADS } from '../schema';
import { Class } from '../types';
import { badRequest, notFound } from '../utils/exceptions.utils';
import { ProductImportDto } from './xlsx/dto/Product';
import { generateXlsx, parse } from './xlsx/utils/xlsx';

const UPLOAD_TYPES: { [type: string]: Class<any> } = {
  products: ProductImportDto,
};

function getUploadType(type: string) {
  const _class = UPLOAD_TYPES[type];
  if (isNil(_class)) {
    throw badRequest(`Invalid type ${type}`);
  }
  return _class;
}

@Injectable()
export class UploadsService {
  constructor(
    @Inject(DB) private db: DbType,
    private productService: ProductService,
    private context: ClsService,
  ) {}

  private PROCESSORS: {
    [key: string]: (data: any[], uploadId: string) => Promise<unknown>;
  } = {
    products: async (data, uploadId) =>
      this.productService.importProducts(data, uploadId),
  };

  async generateTemplate(type: string, response: Response) {
    return await this.generateXlsx(getUploadType(type), response);
  }

  private async generateXlsx<T>(type: Class<T>, response: Response) {
    const filepath = join(process.cwd(), 'templates', `${type.name}.xlsx`);
    response.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename=${type.name}.xlsx`,
    });
    if (!existsSync(filepath)) {
      await generateXlsx(type, filepath);
    }
    return new StreamableFile(createReadStream(filepath));
  }

  async importFile(type: string, file: Buffer) {
    const parsedData = await parse(file, getUploadType(type));
    console.log({ parsedData });

    const processor = this.PROCESSORS[type];
    const upload = await this.db
      .insert(UPLOADS)
      .values({
        type: upperCase(kebabCase(type)),
        status: 'IN_PROGRESS',
        user: this.context.get<Express.UserEntity>('user').username,
      })
      .returning();
    processor(parsedData, upload[0].id);
    return upload[0];
  }

  async getAll() {
    return await this.db.select().from(UPLOADS);
  }

  async getById(id: string) {
    const uploads = await this.db
      .select()
      .from(UPLOADS)
      .where(eq(UPLOADS.id, id));
    if (isEmpty(uploads)) {
      throw notFound(`Upload ${id} not found`);
    }
  }
}

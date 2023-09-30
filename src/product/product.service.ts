import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { chunk as batch, isEmpty, isNil } from 'lodash';
import { ClsService } from 'nestjs-cls';
import { DB, DbType } from '../global/providers/db.provider';
import { Role } from '../roles/role.enum';
import { MARKETS, PRODUCTS, PRODUCT_MARKET, Product, UPLOADS } from '../schema';
import { ProductImportDto } from '../uploads/xlsx/dto/Product';
import { notFound, unauthorized } from '../utils/exceptions.utils';
import { toProductResponses } from '../utils/mappers';
import { ProductRequest, ProductResponse } from './types';
import { validateImportProduct } from './validations/product';

@Injectable()
export class ProductService {
  constructor(
    @Inject(DB) private db: DbType,
    private context: ClsService,
  ) {}

  /**
   * Function to get SQL query for inner join between PRODUCTS & MARKETS tables
   * @returns SQL query
   */
  private getProductsQuery() {
    return this.db
      .select()
      .from(PRODUCTS)
      .innerJoin(PRODUCT_MARKET, eq(PRODUCTS.id, PRODUCT_MARKET.productId))
      .innerJoin(MARKETS, eq(PRODUCT_MARKET.marketCode, MARKETS.code));
  }

  async getAll() {
    const user = this.context.get<Express.UserEntity>('user');
    let query = this.getProductsQuery();
    const currentMarket = this.context.get<number>('market');

    if (!user.superadmin && user.markets[currentMarket] !== Role.ADMIN) {
      query = query.where(eq(PRODUCT_MARKET.marketCode, currentMarket));
    }

    const products = (await query.execute()).map(
      ({ products: product, markets: market }) => ({
        product,
        market,
      }),
    );
    return toProductResponses(...products);
  }

  async getById(id: string) {
    const products = await this.getProductsQuery().where(eq(PRODUCTS.id, id));

    if (isEmpty(products)) {
      throw notFound(`Product ${id} not found`);
    }
    const product = toProductResponses({
      product: products[0].products,
      market: products[0].markets,
    }) as ProductResponse[];

    if (!this.isUserAuthorized(product[0])) {
      throw unauthorized('Cannot access products of unauthorized markets');
    }
    return product[0];
  }

  async create(productRequest: ProductRequest) {
    const markets = await this.db.query.MARKETS.findMany({
      where: inArray(MARKETS.code, productRequest.markets),
    });
    if (markets.length != productRequest.markets.length) {
      throw notFound('One or more markets not found');
    }

    const product = await this.db
      .insert(PRODUCTS)
      .values(productRequest)
      .returning();
    await this.db.insert(PRODUCT_MARKET).values(
      markets.map(({ code }) => ({
        productId: product[0].id,
        marketCode: code,
      })),
    );
    return {
      ...product[0],
      markets,
    };
  }

  async update(id: string, productRequest: Partial<ProductRequest>) {
    delete productRequest.id;

    // Get product, throw if null
    const product = await this.db.query.PRODUCTS.findFirst({
      where: eq(PRODUCTS.id, id),
    });
    if (isNil(product)) {
      throw notFound(`Product ${productRequest.id} not found`);
    }

    // Construct an object of updates
    const update: { [key: string]: any } = {};
    Object.entries(productRequest).forEach((entry) => {
      if (!isNil(entry[1])) {
        update[entry[0]] = entry[1];
      }
    });

    const result = await this.db
      .update(PRODUCTS)
      .set({
        ...update,
      } as Partial<Product>)
      .returning();
    let markets = [];
    if (!isEmpty(productRequest.markets)) {
      markets = await this.db
        .insert(PRODUCT_MARKET)
        .values(
          productRequest.markets.map((market) => ({
            marketCode: market,
            productId: id,
          })),
        )
        .returning()
        .onConflictDoNothing();
    }
    return result[0];
  }

  async delete(id: string) {
    const product = await this.db.query.PRODUCTS.findFirst({
      where: eq(PRODUCTS.id, id),
    });
    if (isNil(product)) {
      throw notFound(`Product ${id} not found`);
    }
    return await this.db.transaction(async (tx) => {
      await tx.delete(PRODUCT_MARKET).where(eq(PRODUCT_MARKET.productId, id));
      await tx.delete(PRODUCTS).where(eq(PRODUCTS.id, id));
      return {
        deleted: true,
      };
    });
  }

  async importProducts(products: ProductImportDto[], uploadId: string) {
    const chunks = batch(products, this.context.get<number>('BATCH_SIZE'));
    const errors: { [key: string]: string }[] = [];
    let errorMessage = '';
    try {
      const promises = chunks.map((chunk) =>
        this._importProducts(chunk, errors),
      );
      await Promise.all(promises);
      errorMessage = errors
        .map((error) => Object.values(error).join(', '))
        .join(', ');
    } catch (ex) {
      errorMessage = ex.message;
    }
    await this.db
      .update(UPLOADS)
      .set({
        errorRows: errors.length,
        status: isEmpty(errors) ? 'COMPLETED' : 'ERROR',
        errorMessage,
        completedAt: new Date(),
      })
      .where(eq(UPLOADS.id, uploadId));
  }

  private async _importProducts(
    products: ProductImportDto[],
    errors: { [key: string]: string }[],
  ) {
    const markets = await this.db
      .select()
      .from(MARKETS)
      .where(
        inArray(
          MARKETS.code,
          products.flatMap((p) => p.markets),
        ),
      );
    products.forEach(async (product) => {
      const validation = validateImportProduct(product);
      if (!isEmpty(validation)) {
        errors.push(validation);
        return;
      }
      const productInDb = await this.db
        .insert(PRODUCTS)
        .values(product)
        .onConflictDoUpdate({
          target: PRODUCTS.code,
          set: {
            name: product.name,
            description: product.description,
            buyingPrice: product.buyingPrice,
            sellingPrice: product.sellingPrice,
          },
        })
        .returning();
      const productMarkets = markets.filter((m) =>
        product.markets.includes(m.code),
      );
      await this.db
        .insert(PRODUCT_MARKET)
        .values(
          productMarkets.map(({ code }) => ({
            marketCode: code,
            productId: productInDb[0].id,
          })),
        )
        .onConflictDoNothing();
    });
  }

  private isUserAuthorized(product: ProductResponse) {
    const loggedInUser = this.context.get<Express.UserEntity>('user');
    const currentMarket = this.context.get<number>('market');
    if (loggedInUser.markets[currentMarket] === Role.ADMIN) return true;
    return (
      loggedInUser.superadmin ||
      product.markets.some(
        (market) => market.code === loggedInUser.markets[currentMarket],
      )
    );
  }
}

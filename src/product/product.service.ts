import { Inject, Injectable } from '@nestjs/common';
import { DB, DbType } from '../global/providers/db.provider';
import _, { entries, isEmpty, isNil } from 'lodash';
import {
  MARKETS,
  NewProduct,
  PRODUCTS,
  PRODUCT_MARKET,
  Product,
} from '../schema';
import { eq, inArray } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';
import { Role } from '../roles/role.enum';
import { toProductResponses } from '../utils/mappers';
import { notFound, unauthorized } from '../utils/exceptions.utils';
import { ProductRequest, ProductResponse } from './types';

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

    if (user.role !== Role.ADMIN) {
      query = query.where(eq(PRODUCT_MARKET.marketCode, user.market));
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

    if (_.isEmpty(products)) {
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

  private isUserAuthorized(product: ProductResponse) {
    const loggedInUser = this.context.get<Express.UserEntity>('user');
    if (loggedInUser.role === Role.ADMIN) return true;
    return product.markets.some(
      (market) => market.code === loggedInUser.market,
    );
  }
}

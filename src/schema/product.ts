import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { MARKETS } from './market';

export const PRODUCTS = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 32 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  description: text('description').notNull(),
  buyingPrice: real('buying_price').notNull(),
  sellingPrice: real('selling_price').notNull(),
  createdOn: timestamp('created_on').defaultNow(),
});

// RELATIONS FOR `PRODUCTS` TABLE
export const PRODUCT_RELATIONS = relations(PRODUCTS, ({ many }) => ({
  // PRODUCTS(one) => PRODUCT_MARKET(many) relation
  markets: many(PRODUCT_MARKET),
}));

// JOIN TABLE
export const PRODUCT_MARKET = pgTable(
  'product_market',
  {
    productId: uuid('product_id')
      .notNull()
      .references(() => PRODUCTS.id),
    marketCode: integer('market_code')
      .notNull()
      .references(() => MARKETS.code),
  },
  (table) => ({
    // Composite primary key for this table
    pk: primaryKey(table.productId, table.marketCode),
  }),
);

// RELATIONS FOR `PRODUCT_MARKET` TABLE
export const PRODUCT_MARKET_RELATIONS = relations(
  PRODUCT_MARKET,
  ({ one }) => ({
    // PRODUCT_MARKET(many) => PRODUCTS(one) relation
    products: one(PRODUCTS, {
      fields: [PRODUCT_MARKET.productId],
      references: [PRODUCTS.id],
    }),
    // PRODUCT_MARKET(many) => MARKETS(one) relation
    markets: one(MARKETS, {
      fields: [PRODUCT_MARKET.marketCode],
      references: [MARKETS.code],
    }),
  }),
);

export type Product = typeof PRODUCTS.$inferSelect;
export type NewProduct = typeof PRODUCTS.$inferInsert;

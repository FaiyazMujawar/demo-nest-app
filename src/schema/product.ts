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

export type Product = typeof PRODUCTS.$inferSelect;
export type NewProduct = typeof PRODUCTS.$inferInsert;

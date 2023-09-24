import { relations } from 'drizzle-orm';
import { integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { PRODUCT_MARKET } from './product';

export const MARKETS = pgTable('markets', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull(),
  code: integer('code').notNull().unique(),
});

export const MARKET_RELATIONS = relations(MARKETS, ({ many }) => ({
  // MARKETS(one) => PRODUCT_MARKET(many) relations
  products: many(PRODUCT_MARKET),
}));

export type Market = typeof MARKETS.$inferSelect;

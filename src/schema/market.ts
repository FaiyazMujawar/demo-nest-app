import { integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const MARKETS = pgTable('markets', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull(),
  code: integer('code').notNull().unique(),
});

export type Market = typeof MARKETS.$inferSelect;

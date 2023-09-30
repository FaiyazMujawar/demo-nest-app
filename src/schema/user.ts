import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { MARKETS } from './market';

export const Roles = pgEnum('Roles', ['USER', 'ADMIN']);

export const USERS = pgTable('app_users', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  firstname: varchar('first_name', { length: 256 }).notNull(),
  lastname: varchar('last_name', { length: 256 }).notNull(),
  email: varchar('email', { length: 50 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 256 }).notNull(),
  contact: integer('contact').notNull(),
  superadmin: boolean('superadmin').default(false),
});

// JOIN TABLE
export const USER_MARKET = pgTable(
  'user_market',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => USERS.id),
    marketCode: integer('market_code')
      .notNull()
      .references(() => MARKETS.code),
    role: Roles('role').default('USER'),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.marketCode),
  }),
);

export type User = typeof USERS.$inferSelect;
export type NewUser = typeof USERS.$inferInsert;

import { integer, pgEnum, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const Roles = pgEnum('Roles', ['USER', 'ADMIN']);

export const users = pgTable('app_users', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  firstname: varchar('first_name', { length: 256 }).notNull(),
  lastname: varchar('last_name', { length: 256 }).notNull(),
  email: varchar('email', { length: 50 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 256 }).notNull(),
  contact: integer('contact').notNull(),
  role: Roles('role').default('USER'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

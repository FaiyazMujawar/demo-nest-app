import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const UPLOAD_STATUS = pgEnum('upload_status', [
  'IN_PROGRESS',
  'COMPLETED',
  'ERROR',
]);

export const UPLOADS = pgTable('uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 32 }).notNull(),
  createdAt: timestamp('created_on').defaultNow(),
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at'),
  status: UPLOAD_STATUS('status'),
  errorRows: integer('error_rows').default(0),
  errorFile: text('error_file'),
  errorMessage: text('error_message'),
  user: varchar('user', { length: 50 }).notNull(),
});

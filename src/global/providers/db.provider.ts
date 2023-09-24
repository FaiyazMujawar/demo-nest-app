import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../schema';

export const DB = Symbol('DATABASE');
export type DbType = PostgresJsDatabase<typeof schema>;

export const DbProvider: FactoryProvider = {
  provide: DB,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const connection = postgres(config.get<string>('DATABASE_URL'), { max: 1 });
    return drizzle(connection, { schema, logger: true });
  },
};

// TODO: swith to using findFirst/findMany

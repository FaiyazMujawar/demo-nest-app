import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv'; // installed by @nestjs/config
dotenv.config();

export default {
  strict: false,
  driver: 'pg',
  schema: './src/schema/*',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
} satisfies Config;

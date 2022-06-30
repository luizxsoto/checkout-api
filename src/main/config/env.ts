import { resolve } from 'path';

import * as dotenv from 'dotenv';

dotenv.config({ path: resolve(process.env.NODE_ENV === 'test' ? '.env.test' : '.env') });

export const envConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: process.env.PORT ?? 3000,
  dbClient: process.env.DB_CLIENT ?? 'pg',
  dbURL: process.env.DB_URL ?? 'postgres://postgres:postgres@localhost:5432/ecommerce',
  jwtSecret: process.env.JWT_SECRET ?? 'eC0M3eRc3-@p1',
};

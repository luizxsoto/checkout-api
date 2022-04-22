import * as dotenv from 'dotenv';
import { Knex } from 'knex';

dotenv.config({ path: '../../.env' });

const config: Knex.Config = {
  client: 'pg',
  connection: process.env.DB_MIGRATIONS_URL,
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
};

// eslint-disable-next-line import/no-default-export
export default config;

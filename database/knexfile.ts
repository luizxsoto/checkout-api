import * as dotenv from 'dotenv';
import { Knex } from 'knex';

dotenv.config({ path: '../../.env' });

// eslint-disable-next-line import/no-default-export
export default <Record<string, Knex.Config>>{
  client: 'pg',
  connection: process.env.DB_MIGRATIONS_URL,
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
};

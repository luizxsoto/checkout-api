import { Knex } from 'knex';

import { envConfig } from '@/main/config';

const config: Knex.Config = {
  client: 'pg',
  connection: envConfig.dbURL,
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
};

// eslint-disable-next-line import/no-default-export
export default config;

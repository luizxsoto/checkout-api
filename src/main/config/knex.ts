import { knex } from 'knex';

import { envConfig } from './env';

export const knexConfig = knex({
  client: 'pg',
  connection: envConfig.dbURL,
});

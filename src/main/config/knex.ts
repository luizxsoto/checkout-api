import { knex } from 'knex';

import { envConfig } from './env';

export const knexConfig = knex({
  client: envConfig.dbClient,
  connection: envConfig.dbURL,
  useNullAsDefault: true,
});

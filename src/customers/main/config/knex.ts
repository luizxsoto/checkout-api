import { knex } from 'knex';

export const knexConfig = knex({
  client: 'pg',
  connection: process.env.DB_URL ?? 'postgres://postgres:postgres@pg/payment_phone_database',
});

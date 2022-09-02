import { Knex } from 'knex'

import { envConfig } from '@/main/config'

export async function up(knex: Knex): Promise<void> {
  if (envConfig.nodeEnv === 'test') return
  await knex.schema.raw('create extension if not exists "unaccent"')
}

export async function down(knex: Knex): Promise<void> {
  if (envConfig.nodeEnv === 'test') return
  await knex.schema.raw('drop extension "unaccent" cascade')
}

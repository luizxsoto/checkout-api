import { Knex } from 'knex'

import { createDefaultTable, dropTable } from '../helpers'

const tableName = 'orders'

export async function up(knex: Knex): Promise<void> {
  await createDefaultTable(knex, {
    tableName,
    columns: (table) => {
      table.uuid('userId').notNullable().references('id').inTable('users')
      table.integer('totalValue').notNullable()
    }
  })
}

export async function down(knex: Knex): Promise<void> {
  await dropTable(knex, { tableName })
}

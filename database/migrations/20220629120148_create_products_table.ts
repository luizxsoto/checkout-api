import { Knex } from 'knex'

import { createDefaultTable, dropTable } from '../helpers'

const tableName = 'products'

export async function up(knex: Knex): Promise<void> {
  await createDefaultTable(knex, {
    tableName,
    columns: (table) => {
      table.string('name', 255).notNullable()
      table.string('category', 100).notNullable()
      table.text('image').notNullable()
      table.integer('price').notNullable()
    },
  })
}

export async function down(knex: Knex): Promise<void> {
  await dropTable(knex, { tableName })
}

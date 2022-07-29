import { Knex } from 'knex'

import { createDefaultTable, dropTable } from '../helpers'

const tableName = 'order_items'

export async function up(knex: Knex): Promise<void> {
  await createDefaultTable(knex, {
    tableName,
    columns: (table) => {
      table.uuid('orderId').notNullable().references('id').inTable('orders')
      table.uuid('productId').notNullable().references('id').inTable('products')
      table.integer('quantity').notNullable()
      table.integer('unitValue').notNullable()
      table.integer('totalValue').notNullable()
    },
  })
}

export async function down(knex: Knex): Promise<void> {
  await dropTable(knex, { tableName })
}

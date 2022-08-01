import { Knex } from 'knex'

import { dropTable } from '../helpers'

const tableName = 'users'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tableName, (table) => {
    table.uuid('id').primary().notNullable()

    table.string('name', 100).notNullable()
    table.string('email', 100).notNullable()
    table.string('password', 100).notNullable()
    table.jsonb('roles').notNullable()

    table.uuid('createUserId').nullable().references('id').inTable('users')
    table.uuid('updateUserId').nullable().references('id').inTable('users')
    table.uuid('deleteUserId').nullable().references('id').inTable('users')
    table.timestamp('createdAt').notNullable()
    table.timestamp('updatedAt').nullable()
    table.timestamp('deletedAt').nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await dropTable(knex, { tableName })
}

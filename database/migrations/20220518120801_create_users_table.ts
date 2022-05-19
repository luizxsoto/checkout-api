import { Knex } from 'knex';

import { createDefaultTable, dropTable } from '../helpers';

const tableName = 'users';

export async function up(knex: Knex): Promise<void> {
  await createDefaultTable(knex, {
    tableName,
    columns: (table) => {
      table.string('name', 100).notNullable();
      table.string('email', 100).notNullable();
      table.string('username', 20).notNullable();
      table.string('password', 100).notNullable();
    },
  });
}

export async function down(knex: Knex): Promise<void> {
  await dropTable(knex, { tableName });
}
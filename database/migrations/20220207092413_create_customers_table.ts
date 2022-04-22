import { Knex } from 'knex';

import { createDefaultTable, dropTable } from '@db/helpers';

const tableName = 'customers';

export async function up(knex: Knex): Promise<void> {
  await createDefaultTable(knex, {
    tableName,
    columns: (table) => {
      table.string('name', 100).notNullable();
      table.string('email', 100).unique().notNullable();
    },
  });
}

export async function down(knex: Knex): Promise<void> {
  await dropTable(knex, { tableName });
}

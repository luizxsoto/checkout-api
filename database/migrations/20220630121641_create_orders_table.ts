import { Knex } from 'knex';

import { createDefaultTable, dropTable } from '../helpers';

const tableName = 'orders';

export async function up(knex: Knex): Promise<void> {
  await createDefaultTable(knex, {
    tableName,
    columns: (table) => {
      table.uuid('customerId').notNullable().references('id').inTable('customers');
      table.uuid('paymentProfileId').notNullable().references('id').inTable('payment_profiles');
      table.integer('totalValue').notNullable();
    },
  });
}

export async function down(knex: Knex): Promise<void> {
  await dropTable(knex, { tableName });
}

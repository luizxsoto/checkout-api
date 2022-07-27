import { Knex } from 'knex';

import { createDefaultTable, dropTable } from '../helpers';

const tableName = 'payment_profiles';

export async function up(knex: Knex): Promise<void> {
  await createDefaultTable(knex, {
    tableName,
    columns: (table) => {
      table.uuid('userId').notNullable().references('id').inTable('users');
      table.string('type', 6).notNullable();
      table.string('brand', 20).notNullable();
      table.string('holderName', 25).notNullable();
      table.text('number').notNullable();
      table.string('firstSix', 6).notNullable();
      table.string('lastFour', 4).notNullable();
      table.text('cvv').notNullable();
      table.integer('expiryMonth').notNullable();
      table.integer('expiryYear').notNullable();
    },
  });
}

export async function down(knex: Knex): Promise<void> {
  await dropTable(knex, { tableName });
}

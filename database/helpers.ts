import { Knex } from 'knex';

export interface CreateTableOptions {
  tableName: string;
  columns: (table: Knex.CreateTableBuilder) => void;
}

export async function createDefaultTable(knex: Knex, options: CreateTableOptions): Promise<void> {
  await knex.schema.createTable(options.tableName, (table) => {
    table.uuid('id').primary().notNullable();

    options.columns(table);

    table.timestamp('createdAt').notNullable();
    table.timestamp('updatedAt').nullable();
    table.timestamp('deletedAt').nullable();
  });
}

export interface DropTableOptions {
  tableName: string;
}

export async function dropTable(knex: Knex, options: DropTableOptions): Promise<void> {
  await knex.schema.dropTable(options.tableName);
}

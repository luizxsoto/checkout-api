import { Knex } from 'knex';

import { CustomerModel } from '@/domain/models';
import { envConfig } from '@/main/config';

const tableName = 'customers';
const customers: (Omit<CustomerModel, 'createdAt'> & {
  createdAt: string;
})[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    createUserId: '00000000-0000-4000-8000-000000000001',
    createdAt: new Date().toISOString(),
    name: 'Customer',
    email: 'customer@email.com',
  },
];

export async function up(knex: Knex): Promise<void> {
  if (envConfig.nodeEnv === 'production') return;

  await knex.table(tableName).insert(customers);
}

export async function down(knex: Knex): Promise<void> {
  if (envConfig.nodeEnv === 'production') return;

  const customerIds = customers.map((customer) => customer.id);

  await knex.table(tableName).whereIn('id', customerIds).delete();
}

import { Knex } from 'knex';

import { OrderModel } from '@/domain/models';
import { envConfig } from '@/main/config';

const tableName = 'orders';
const orders: (Omit<OrderModel, 'createdAt'> & {
  createdAt: string;
})[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    createUserId: '00000000-0000-4000-8000-000000000001',
    createdAt: new Date().toISOString(),
    userId: '00000000-0000-4000-8000-000000000001',
    totalValue: 1000,
  },
];

export async function up(knex: Knex): Promise<void> {
  if (envConfig.nodeEnv === 'production') return;

  await knex.table(tableName).insert(orders);
}

export async function down(knex: Knex): Promise<void> {
  if (envConfig.nodeEnv === 'production') return;

  const orderIds = orders.map((order) => order.id);

  await knex.table(tableName).whereIn('id', orderIds).delete();
}

import { Knex } from 'knex'

import { OrderItemModel } from '@/domain/models'
import { envConfig } from '@/main/config'

const tableName = 'order_items'
const orderItems: (Omit<OrderItemModel, 'createdAt'> & {
  createdAt: string
})[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    createUserId: '00000000-0000-4000-8000-000000000001',
    createdAt: new Date().toISOString(),
    orderId: '00000000-0000-4000-8000-000000000001',
    productId: '00000000-0000-4000-8000-000000000001',
    quantity: 1,
    unitValue: 1000,
    totalValue: 1000,
  },
]

export async function up(knex: Knex): Promise<void> {
  if (envConfig.nodeEnv === 'production') return

  await knex.table(tableName).insert(orderItems)
}

export async function down(knex: Knex): Promise<void> {
  if (envConfig.nodeEnv === 'production') return

  const orderItemIds = orderItems.map((orderItem) => orderItem.id)

  await knex.table(tableName).whereIn('id', orderItemIds).delete()
}

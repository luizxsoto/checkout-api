import { Knex } from 'knex'

import { ProductModel } from '@/domain/models'
import { envConfig } from '@/main/config'

const tableName = 'products'
const products: (Omit<ProductModel, 'createdAt'> & {
  createdAt: string
})[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    createUserId: '00000000-0000-4000-8000-000000000001',
    createdAt: new Date().toISOString(),
    name: 'Product 1',
    category: 'clothes',
    image: 'https://boacausa.net/img/image-placeholder.png',
    price: 1000
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    createUserId: '00000000-0000-4000-8000-000000000001',
    createdAt: new Date().toISOString(),
    name: 'Product 2',
    category: 'shoes',
    image: 'https://boacausa.net/img/image-placeholder.png',
    price: 2000
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    createUserId: '00000000-0000-4000-8000-000000000001',
    createdAt: new Date().toISOString(),
    name: 'Product 3',
    category: 'others',
    image: 'https://boacausa.net/img/image-placeholder.png',
    price: 3000
  }
]

export async function up(knex: Knex): Promise<void> {
  if (envConfig.nodeEnv === 'production') return

  await knex.table(tableName).insert(products)
}

export async function down(knex: Knex): Promise<void> {
  if (envConfig.nodeEnv === 'production') return

  const productIds = products.map((product) => product.id)

  await knex.table(tableName).whereIn('id', productIds).delete()
}

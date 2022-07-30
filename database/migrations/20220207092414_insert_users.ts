import { hash } from 'bcrypt'
import { Knex } from 'knex'

import { UserModel } from '@/domain/models'
import { envConfig } from '@/main/config'

const tableName = 'users'
const users: () => Promise<
  (Omit<UserModel, 'roles' | 'createdAt'> & {
    createdAt: string
    roles: string
  })[]
> = async () => [
  {
    id: '00000000-0000-4000-8000-000000000001',
    createUserId: '00000000-0000-4000-8000-000000000001',
    createdAt: new Date().toISOString(),
    name: 'Admin',
    email: 'admin@email.com',
    password: await hash('Password@123', 12),
    roles: JSON.stringify(['admin'])
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    createUserId: '00000000-0000-4000-8000-000000000001',
    createdAt: new Date().toISOString(),
    name: 'Moderator',
    email: 'moderator@email.com',
    password: await hash('Password@123', 12),
    roles: JSON.stringify(['moderator'])
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    createUserId: '00000000-0000-4000-8000-000000000001',
    createdAt: new Date().toISOString(),
    name: 'Normal',
    email: 'normal@email.com',
    password: await hash('Password@123', 12),
    roles: JSON.stringify([])
  }
]

export async function up(knex: Knex): Promise<void> {
  if (envConfig.nodeEnv === 'production') return

  await knex.table(tableName).insert(await users())
}

export async function down(knex: Knex): Promise<void> {
  if (envConfig.nodeEnv === 'production') return

  const userIds = (await users()).map((user) => user.id)

  await knex.table(tableName).whereIn('id', userIds).delete()
}

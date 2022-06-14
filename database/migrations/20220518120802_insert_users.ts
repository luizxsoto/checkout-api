import { hash } from 'bcrypt';
import { Knex } from 'knex';

const tableName = 'users';
const users = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    createUserId: '00000000-0000-4000-8000-000000000001',
    createdAt: new Date().toISOString(),
    updatedAt: null,
    deletedAt: null,
    name: 'Admin',
    email: 'admin@email.com',
    roles: JSON.stringify(['admin']),
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    createUserId: '00000000-0000-4000-8000-000000000001',
    createdAt: new Date().toISOString(),
    updatedAt: null,
    deletedAt: null,
    name: 'Moderator',
    email: 'moderator@email.com',
    roles: JSON.stringify(['moderator']),
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    createUserId: '00000000-0000-4000-8000-000000000001',
    createdAt: new Date().toISOString(),
    updatedAt: null,
    deletedAt: null,
    name: 'Normal',
    email: 'normal@email.com',
    roles: JSON.stringify([]),
  },
];

export async function up(knex: Knex): Promise<void> {
  const password = await hash('Password@123', 12);

  await knex.table(tableName).insert(users.map((user) => ({ ...user, password })));
}

export async function down(knex: Knex): Promise<void> {
  const userIds = users.map((user) => user.id);

  await knex.table(tableName).whereIn('id', userIds).delete();
}

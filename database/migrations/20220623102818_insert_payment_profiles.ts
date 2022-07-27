import { hash } from 'bcrypt';
import { Knex } from 'knex';

import { PaymentProfileModel } from '@/domain/models';
import { envConfig } from '@/main/config';

const tableName = 'payment_profiles';
const paymentProfiles: () => Promise<
  (Omit<PaymentProfileModel, 'createdAt'> & { createdAt: string })[]
> = async () => [
  {
    id: '00000000-0000-4000-8000-000000000001',
    createUserId: '00000000-0000-4000-8000-000000000001',
    createdAt: new Date().toISOString(),
    userId: '00000000-0000-4000-8000-000000000001',
    type: 'CREDIT',
    brand: 'brand',
    holderName: 'holderName',
    number: await hash('1234567890123456', 12),
    firstSix: '123456',
    lastFour: '3456',
    cvv: await hash('123', 12),
    expiryMonth: 12,
    expiryYear: 1234,
  },
];

export async function up(knex: Knex): Promise<void> {
  if (envConfig.nodeEnv === 'production') return;

  await knex.table(tableName).insert(await paymentProfiles());
}

export async function down(knex: Knex): Promise<void> {
  if (envConfig.nodeEnv === 'production') return;

  const paymentProfileIds = (await paymentProfiles()).map((paymentProfile) => paymentProfile.id);

  await knex.table(tableName).whereIn('id', paymentProfileIds).delete();
}

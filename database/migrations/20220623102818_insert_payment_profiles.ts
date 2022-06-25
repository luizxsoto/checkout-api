import { hash } from 'bcrypt';
import { Knex } from 'knex';

import { PaymentProfileModel } from '@/domain/models';
import { envConfig } from '@/main/config';

const tableName = 'payment_profiles';
const customers: () => Promise<
  (Omit<PaymentProfileModel, 'createdAt'> & {
    createdAt: string;
  })[]
> = async () => [
  <
    Omit<PaymentProfileModel<'CARD_PAYMENT'>, 'createdAt'> & {
      createdAt: string;
    }
  >{
    id: '00000000-0000-4000-8000-000000000001',
    createUserId: '00000000-0000-4000-8000-000000000001',
    createdAt: new Date().toISOString(),
    customerId: '00000000-0000-4000-8000-000000000001',
    type: 'CARD_PAYMENT',
    data: {
      type: 'CREDIT',
      brand: 'brand',
      holderName: 'holderName',
      number: await hash('1234567890123456', 12),
      firstSix: '123456',
      lastFour: '3456',
      cvv: await hash('123', 12),
      expiryMonth: '12',
      expiryYear: '1234',
    },
  },
  <
    Omit<PaymentProfileModel<'PHONE_PAYMENT'>, 'createdAt'> & {
      createdAt: string;
    }
  >{
    id: '00000000-0000-4000-8000-000000000002',
    createUserId: '00000000-0000-4000-8000-000000000001',
    createdAt: new Date().toISOString(),
    customerId: '00000000-0000-4000-8000-000000000001',
    type: 'PHONE_PAYMENT',
    data: {
      countryCode: '1234',
      areaCode: '1234',
      number: '1234567890',
    },
  },
];

export async function up(knex: Knex): Promise<void> {
  if (envConfig.nodeEnv === 'production') return;

  await knex.table(tableName).insert(await customers());
}

export async function down(knex: Knex): Promise<void> {
  if (envConfig.nodeEnv === 'production') return;

  const customerIds = (await customers()).map((customer) => customer.id);

  await knex.table(tableName).whereIn('id', customerIds).delete();
}

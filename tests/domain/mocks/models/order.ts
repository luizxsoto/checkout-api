import { makeBaseModelMock } from './base';

import { OrderModel } from '@/domain/models';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';

export function makeOrderModelMock(extraData?: Partial<OrderModel>) {
  return {
    ...makeBaseModelMock(extraData),
    userId: validUuidV4,
    totalValue: 1000,
    ...extraData,
  };
}

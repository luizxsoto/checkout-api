import { makeBaseModelMock } from './base'

import { OrderItemModel } from '@/domain/models'

const validUuidV4 = '00000000-0000-4000-8000-000000000001'

export function makeOrderItemModelMock(extraData?: Partial<OrderItemModel>) {
  return {
    ...makeBaseModelMock(extraData),
    orderId: validUuidV4,
    productId: validUuidV4,
    quantity: 1,
    unitValue: 1000,
    totalValue: 1000,
    ...extraData,
  }
}

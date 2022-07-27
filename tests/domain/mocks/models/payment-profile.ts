import { makeBaseModelMock } from './base';

import { PaymentProfileModel } from '@/domain/models';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';

export function makePaymentProfileModelMock(extraData?: Partial<PaymentProfileModel>) {
  return new PaymentProfileModel({
    ...makeBaseModelMock(extraData),
    userId: validUuidV4,
    type: 'CREDIT',
    brand: 'any_brand',
    holderName: 'any_holderName',
    number: '1234567890123456',
    firstSix: '123456',
    lastFour: '3456',
    cvv: '123',
    expiryYear: 9999,
    expiryMonth: 12,
    ...extraData,
  });
}

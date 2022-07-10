import { makeBaseModelMock } from './base';

import { PaymentProfileModel } from '@/domain/models';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';

export function makePaymentProfileModelMock(extraData?: Partial<PaymentProfileModel>) {
  return new PaymentProfileModel({
    ...makeBaseModelMock(extraData),
    customerId: validUuidV4,
    paymentMethod: 'CARD_PAYMENT',
    data: {
      type: 'CREDIT',
      brand: 'any_brand',
      holderName: 'any_holderName',
      number: '1234567890123456',
      firstSix: '123456',
      lastFour: '3456',
      cvv: '123',
      expiryYear: '1234',
      expiryMonth: '12',
      areaCode: '1234',
      countryCode: '1234',
    },
    ...extraData,
  });
}

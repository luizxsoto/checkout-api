import { makeBaseModelMock } from './base';

import { CustomerModel } from '@/domain/models';

export function makeCustomerModelMock(extraData?: Partial<CustomerModel>) {
  return new CustomerModel({
    ...makeBaseModelMock(extraData),
    name: 'Any Name',
    email: 'valid@email.com',
    ...extraData,
  });
}

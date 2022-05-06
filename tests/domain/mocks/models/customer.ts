import { CustomerModel } from '@/domain/models';

export function makeCustomerModelMock(extraData?: Partial<CustomerModel>) {
  return new CustomerModel({
    id: 'any_id',
    createdAt: new Date(),
    name: 'Any Name',
    email: 'valid@email.com',
    ...extraData,
  });
}

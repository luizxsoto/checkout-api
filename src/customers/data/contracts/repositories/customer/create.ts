import { CustomerModel } from '@/customers/domain/models';

export type RequestModel = Omit<CustomerModel, 'id' & 'createdAt'>;

export type ResponseModel = CustomerModel;

export interface Repository {
  create: (requestModel: RequestModel) => Promise<ResponseModel>;
}

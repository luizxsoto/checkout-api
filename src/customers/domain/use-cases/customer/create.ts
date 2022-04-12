import { CustomerModel } from '@/customers/domain/models';

export type RequestModel = Omit<CustomerModel, 'id'>;

export type ResponseModel = CustomerModel;

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

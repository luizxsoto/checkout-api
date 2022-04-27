import { CustomerModel } from '@/domain/models';

export type RequestModel = Partial<CustomerModel>;

export type ResponseModel = CustomerModel[];

export interface Repository {
  findBy: (requestModel: RequestModel) => Promise<ResponseModel>;
}

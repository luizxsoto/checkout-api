import { CustomerModel } from '@/domain/models';

export type RequestModel = Parameters<(where: Partial<CustomerModel>) => void>;

export type ResponseModel = CustomerModel;

export interface Repository {
  remove: (...requestModel: RequestModel) => Promise<ResponseModel>;
}

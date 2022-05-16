import { CustomerModel } from '@/domain/models';

export type RequestModel = Partial<
  Omit<CustomerModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
>;

export type ResponseModel = CustomerModel[];

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}
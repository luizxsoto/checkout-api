import { CustomerModel } from '@/domain/models';

export type RequestModel = { id: string };

export type ResponseModel = CustomerModel;

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

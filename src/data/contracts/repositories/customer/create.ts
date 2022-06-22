import { CustomerModel } from '@/domain/models';

export type RequestModel = Omit<
  CustomerModel,
  'id' | 'createUserId' | 'updateUserId' | 'deleteUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export type ResponseModel = CustomerModel;

export interface Repository {
  create: (requestModel: RequestModel) => Promise<ResponseModel>;
}

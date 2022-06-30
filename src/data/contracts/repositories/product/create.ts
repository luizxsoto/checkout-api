import { ProductModel } from '@/domain/models';

export type RequestModel = Omit<
  ProductModel,
  'id' | 'createUserId' | 'updateUserId' | 'deleteUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export type ResponseModel = ProductModel;

export interface Repository {
  create: (requestModel: RequestModel) => Promise<ResponseModel>;
}

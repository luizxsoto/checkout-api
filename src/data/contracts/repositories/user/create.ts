import { UserModel } from '@/domain/models';

export type RequestModel = Omit<
  UserModel,
  'id' | 'updateUserId' | 'deleteUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export type ResponseModel = UserModel;

export interface Repository {
  create: (requestModel: RequestModel) => Promise<ResponseModel>;
}

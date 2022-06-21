import { UserModel } from '@/domain/models';

export type RequestModel = Omit<
  UserModel,
  'id' | 'updateUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export type ResponseModel = UserModel;

export interface Repository {
  create: (requestModel: RequestModel) => Promise<ResponseModel>;
}

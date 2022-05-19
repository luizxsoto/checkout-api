import { UserModel } from '@/domain/models';

export type RequestModel = Omit<UserModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export type ResponseModel = UserModel;

export interface Repository {
  create: (requestModel: RequestModel) => Promise<ResponseModel>;
}

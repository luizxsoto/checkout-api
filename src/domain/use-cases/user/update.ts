import { UserModel } from '@/domain/models';

export type RequestModel = { id: string } & Partial<
  Omit<UserModel, 'id' | 'createUserId' | 'updateUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'>
>;

export type ResponseModel = UserModel;

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

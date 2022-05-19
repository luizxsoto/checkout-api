import { UserModel } from '@/domain/models';

export type RequestModel = Parameters<
  (
    where: Partial<UserModel>,
    model: Partial<Omit<UserModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
  ) => void
>;

export type ResponseModel = UserModel;

export interface Repository {
  update: (...requestModel: RequestModel) => Promise<ResponseModel>;
}

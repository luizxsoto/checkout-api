import { UserModel } from '@/domain/models';

export type RequestModel = Partial<Omit<UserModel, 'roles'>>[];

export type ResponseModel = UserModel[];

export interface Repository {
  findBy: (requestModel: RequestModel) => Promise<ResponseModel>;
}

import { UserModel } from '@/domain/models';

export type RequestModel = Partial<UserModel>[];

export type ResponseModel = UserModel[];

export interface Repository {
  findBy: (requestModel: RequestModel) => Promise<ResponseModel>;
}

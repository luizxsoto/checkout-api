import { UserModel } from '@/domain/models';

export type RequestModel = { id: string };

export type ResponseModel = UserModel;

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

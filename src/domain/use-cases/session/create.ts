import { UserModel } from '@/domain/models';

export type RequestModel = {
  email: string;
  password: string;
};

export type ResponseModel = Omit<UserModel, 'password'> & { bearerToken: string };

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

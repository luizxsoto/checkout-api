import { CustomerModel } from '@/domain/models';

export type RequestModel = {
  email: string;
  password: string;
};

export type ResponseModel = CustomerModel & { accessToken: string };

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

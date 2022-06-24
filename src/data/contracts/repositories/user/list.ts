import { UserModel } from '@/domain/models';

export type RequestModel = {
  pege?: number;
  perPage?: number;
  orderBy?: string;
  order?: string;
  filters?: string;
};

export type ResponseModel = Omit<UserModel, 'password'>[];

export interface Repository {
  list: (requestModel: RequestModel) => Promise<ResponseModel>;
}

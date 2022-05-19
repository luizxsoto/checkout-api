import { UserModel } from '@/domain/models';

export type RequestModel = {
  pege?: number;
  perPage?: number;
  orderBy?: string;
  order?: string;
} & Partial<UserModel>;

export type ResponseModel = UserModel[];

export interface Repository {
  list: (requestModel: RequestModel) => Promise<ResponseModel>;
}

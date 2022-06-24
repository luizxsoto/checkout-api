import { UserModel } from '@/domain/models';

export type RequestModel = {
  page?: number;
  perPage?: number;
  orderBy?: 'name' | 'email' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
  filters?: string;
};

export type ResponseModel = Omit<UserModel, 'password'>[];

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

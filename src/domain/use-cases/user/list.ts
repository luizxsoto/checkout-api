import { UserModel } from '@/domain/models';

export type RequestModel = {
  page?: number;
  perPage?: number;
  orderBy?: 'name' | 'email' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
} & Partial<Omit<UserModel, 'id' | 'password' | 'createdAt' | 'updatedAt' | 'deletedAt'>>;

export type ResponseModel = UserModel[];

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

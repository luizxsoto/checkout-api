import { UserModel } from '@/domain/models';

export type RequestModel = Parameters<
  (where: Partial<UserModel>[], sanitizeResponse?: boolean) => void
>;

export type ResponseModel<Type = 'NORMAL' | 'SANITIZED'> = Type extends 'NORMAL'
  ? UserModel[]
  : Omit<UserModel, 'password'>[];

export interface Repository<Type = 'NORMAL' | 'SANITIZED'> {
  findBy: (...requestModel: RequestModel) => Promise<ResponseModel<Type>>;
}

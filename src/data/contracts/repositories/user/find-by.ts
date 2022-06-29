import { UserModel } from '@/domain/models';

export type RequestModel = Parameters<
  (where: Partial<UserModel>[], sanitizeResponse?: boolean) => void
>;

export type ResponseModel<PaymentMethod = 'NORMAL' | 'SANITIZED'> = PaymentMethod extends 'NORMAL'
  ? UserModel[]
  : Omit<UserModel, 'password'>[];

export interface Repository<PaymentMethod = 'NORMAL' | 'SANITIZED'> {
  findBy: (...requestModel: RequestModel) => Promise<ResponseModel<PaymentMethod>>;
}

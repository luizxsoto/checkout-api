import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = Parameters<
  (where: Partial<PaymentProfileModel>[], sanitizeResponse?: boolean) => void
>;

export type ResponseModel<Type = 'NORMAL' | 'SANITIZED'> = Type extends 'NORMAL'
  ? PaymentProfileModel[]
  : Omit<PaymentProfileModel, 'number' | 'cvv'>[];

export interface Repository<Type = 'NORMAL' | 'SANITIZED'> {
  findBy: (...requestModel: RequestModel) => Promise<ResponseModel<Type>>;
}

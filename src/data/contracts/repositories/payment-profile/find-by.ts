import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = Parameters<
  (where: Partial<PaymentProfileModel>[], sanitizeResponse?: boolean) => void
>;

export type ResponseModel<Type = 'NORMAL' | 'SANITIZED'> = Type extends 'NORMAL'
  ? PaymentProfileModel[]
  : (Omit<PaymentProfileModel, 'data'> & {
      data: Omit<PaymentProfileModel['data'], 'number' | 'cvv'> & { number?: string };
    })[];

export interface Repository<Type = 'NORMAL' | 'SANITIZED'> {
  findBy: (...requestModel: RequestModel) => Promise<ResponseModel<Type>>;
}

import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = Parameters<
  (where: Partial<PaymentProfileModel>[], sanitizeResponse?: boolean) => void
>;

export type ResponseModel<PaymentMethod = 'NORMAL' | 'SANITIZED'> = PaymentMethod extends 'NORMAL'
  ? PaymentProfileModel[]
  : (Omit<PaymentProfileModel, 'data'> & {
      data: Omit<PaymentProfileModel['data'], 'number' | 'cvv'> & { number?: string };
    })[];

export interface Repository<PaymentMethod = 'NORMAL' | 'SANITIZED'> {
  findBy: (...requestModel: RequestModel) => Promise<ResponseModel<PaymentMethod>>;
}

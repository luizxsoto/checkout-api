import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = { id: string };

export type ResponseModel = Omit<PaymentProfileModel, 'data'> & {
  data: Omit<PaymentProfileModel['data'], 'number' | 'cvv'> & { number?: string };
};

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

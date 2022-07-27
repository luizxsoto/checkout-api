import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = { id: string };

export type ResponseModel = Omit<PaymentProfileModel, 'cvv' | 'number'>;

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

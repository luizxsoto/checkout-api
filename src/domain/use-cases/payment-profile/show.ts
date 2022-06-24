import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = { id: string };

export type ResponseModel = PaymentProfileModel;

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = Parameters<(where: Partial<PaymentProfileModel>) => void>;

export type ResponseModel = PaymentProfileModel[];

export interface Repository {
  remove: (...requestModel: RequestModel) => Promise<ResponseModel>;
}

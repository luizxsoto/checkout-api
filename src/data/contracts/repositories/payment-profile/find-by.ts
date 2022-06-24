import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = Partial<PaymentProfileModel>[];

export type ResponseModel = PaymentProfileModel[];

export interface Repository {
  findBy: (requestModel: RequestModel) => Promise<ResponseModel>;
}

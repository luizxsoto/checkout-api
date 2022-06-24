import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = Omit<
  PaymentProfileModel,
  'id' | 'createUserId' | 'updateUserId' | 'deleteUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export type ResponseModel = PaymentProfileModel;

export interface Repository {
  create: (requestModel: RequestModel) => Promise<ResponseModel>;
}

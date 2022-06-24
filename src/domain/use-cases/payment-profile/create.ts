import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = Omit<
  PaymentProfileModel,
  'id' | 'createUserId' | 'updateUserId' | 'deleteUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export type ResponseModel = PaymentProfileModel;

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

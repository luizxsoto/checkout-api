import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = Omit<
  PaymentProfileModel,
  | 'id'
  | 'firstSix'
  | 'lastFour'
  | 'createUserId'
  | 'updateUserId'
  | 'deleteUserId'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>;

export type ResponseModel = Omit<PaymentProfileModel, 'cvv' | 'number'>;

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

import { PaymentProfileModel } from '@/domain/models';

export type RequestModel<PaymentMethod = 'CARD_PAYMENT' | 'PHONE_PAYMENT'> = {
  data: Omit<PaymentProfileModel<PaymentMethod>['data'], 'firstSix' | 'lastFour'>;
} & Omit<
  PaymentProfileModel,
  | 'id'
  | 'data'
  | 'createUserId'
  | 'updateUserId'
  | 'deleteUserId'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>;

export type ResponseModel = {
  data: Omit<PaymentProfileModel['data'], 'cvv' | 'number'> & { number?: string };
} & Omit<PaymentProfileModel, 'data'>;

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

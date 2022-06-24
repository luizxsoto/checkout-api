import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = { id: string; customerId: string } & Partial<
  Omit<
    PaymentProfileModel,
    | 'id'
    | 'customerId'
    | 'createUserId'
    | 'updateUserId'
    | 'deleteUserId'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
  >
>;

export type ResponseModel = PaymentProfileModel;

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

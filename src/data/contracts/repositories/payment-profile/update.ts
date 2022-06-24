import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = Parameters<
  (
    where: Partial<PaymentProfileModel>,
    model: Partial<
      Omit<
        PaymentProfileModel,
        | 'id'
        | 'createUserId'
        | 'updateUserId'
        | 'deleteUserId'
        | 'createdAt'
        | 'updatedAt'
        | 'deletedAt'
      >
    >,
  ) => void
>;

export type ResponseModel = PaymentProfileModel[];

export interface Repository {
  update: (...requestModel: RequestModel) => Promise<ResponseModel>;
}

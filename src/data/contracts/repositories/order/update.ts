import { OrderModel } from '@/domain/models';

export type RequestModel = Parameters<
  (
    where: Partial<OrderModel>,
    model: Partial<
      Omit<
        OrderModel,
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

export type ResponseModel = OrderModel[];

export interface Repository {
  update: (...requestModel: RequestModel) => Promise<ResponseModel>;
}

import { OrderModel } from '@/domain/models';

export type RequestModel = Omit<
  OrderModel,
  | 'status'
  | 'totalValue'
  | 'createUserId'
  | 'updateUserId'
  | 'deleteUserId'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>;

export type ResponseModel = OrderModel;

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

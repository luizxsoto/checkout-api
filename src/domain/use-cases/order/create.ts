import { OrderItemModel, OrderModel } from '@/domain/models';

export type RequestModel = Omit<
  OrderModel,
  | 'id'
  | 'status'
  | 'totalValue'
  | 'createUserId'
  | 'updateUserId'
  | 'deleteUserId'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
> & {
  orderItems: Omit<
    OrderItemModel,
    | 'id'
    | 'orderId'
    | 'unitValue'
    | 'totalValue'
    | 'createUserId'
    | 'updateUserId'
    | 'deleteUserId'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
  >[];
};

export type ResponseModel = OrderModel & { orderItems: OrderItemModel[] };

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}

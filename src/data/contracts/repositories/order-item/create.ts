import { OrderItemModel } from '@/domain/models';

export type RequestModel = Omit<
  OrderItemModel,
  'id' | 'createUserId' | 'updateUserId' | 'deleteUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>[];

export type ResponseModel = OrderItemModel[];

export interface Repository {
  create: (requestModel: RequestModel) => Promise<ResponseModel>;
}

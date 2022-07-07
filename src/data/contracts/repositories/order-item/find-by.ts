import { OrderItemModel } from '@/domain/models';

export type RequestModel = Partial<OrderItemModel>[];

export type ResponseModel = OrderItemModel[];

export interface Repository {
  findBy: (requestModel: RequestModel) => Promise<ResponseModel>;
}

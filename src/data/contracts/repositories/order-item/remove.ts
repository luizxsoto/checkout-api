import { OrderItemModel } from '@/domain/models';

export type RequestModel = Parameters<(where: Partial<OrderItemModel>) => void>;

export type ResponseModel = OrderItemModel[];

export interface Repository {
  remove: (...requestModel: RequestModel) => Promise<ResponseModel>;
}

import { OrderModel } from '@/domain/models';

export type RequestModel = Parameters<(where: Partial<OrderModel>) => void>;

export type ResponseModel = OrderModel[];

export interface Repository {
  remove: (...requestModel: RequestModel) => Promise<ResponseModel>;
}

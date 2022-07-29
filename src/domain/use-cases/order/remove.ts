import { OrderItemModel, OrderModel } from '@/domain/models'

export type RequestModel = { id: string }

export type ResponseModel = OrderModel & { orderItems: OrderItemModel[] }

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>
}

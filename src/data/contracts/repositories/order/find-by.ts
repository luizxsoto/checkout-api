import { OrderModel } from '@/domain/models'

export type RequestModel = Partial<OrderModel>[]

export type ResponseModel = OrderModel[]

export interface Repository {
  findBy: (requestModel: RequestModel) => Promise<ResponseModel>
}

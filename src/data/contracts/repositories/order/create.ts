import { OrderModel } from '@/domain/models'

export type RequestModel = Omit<
  OrderModel,
  'id' | 'createUserId' | 'updateUserId' | 'deleteUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>[]

export type ResponseModel = OrderModel[]

export interface Repository {
  create: (requestModel: RequestModel) => Promise<ResponseModel>
}

import { OrderItemModel } from '@/domain/models'

export type RequestModel = Parameters<
  (
    where: Partial<OrderItemModel>,
    model: Partial<
      Omit<
        OrderItemModel,
        | 'id'
        | 'createUserId'
        | 'updateUserId'
        | 'deleteUserId'
        | 'createdAt'
        | 'updatedAt'
        | 'deletedAt'
      >
    >
  ) => void
>

export type ResponseModel = OrderItemModel[]

export interface Repository {
  update: (...requestModel: RequestModel) => Promise<ResponseModel>
}

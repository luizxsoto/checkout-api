import { OrderModel, UserModel } from '@/domain/models'
import { UpdateOrderUseCase } from '@/domain/use-cases'

export type UpdateOrderValidation = (
  requestModel: UpdateOrderUseCase.RequestModel
) => Promise<
  (validationData: { orders: OrderModel[]; users: Omit<UserModel, 'password'>[] }) => Promise<void>
>

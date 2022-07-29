import { ProductModel, UserModel } from '@/domain/models'
import { CreateOrderUseCase } from '@/domain/use-cases'

export type CreateOrderValidation = (
  requestModel: CreateOrderUseCase.RequestModel
) => Promise<
  (validationData: {
    users: Omit<UserModel, 'password'>[]
    products: ProductModel[]
  }) => Promise<void>
>

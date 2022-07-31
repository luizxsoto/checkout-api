import { ProductModel } from '@/domain/models'
import { CreateOrderUseCase } from '@/domain/use-cases'

export type CreateOrderValidation = (
  requestModel: CreateOrderUseCase.RequestModel
) => Promise<(validationData: { products: ProductModel[] }) => Promise<void>>

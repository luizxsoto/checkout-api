import { ProductModel } from '@/domain/models'
import { ShowProductUseCase } from '@/domain/use-cases'

export type ShowProductValidation = (
  requestModel: ShowProductUseCase.RequestModel
) => Promise<(validationData: { products: ProductModel[] }) => Promise<void>>

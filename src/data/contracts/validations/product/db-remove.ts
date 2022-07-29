import { ProductModel } from '@/domain/models'
import { RemoveProductUseCase } from '@/domain/use-cases'

export type RemoveProductValidation = (
  requestModel: RemoveProductUseCase.RequestModel
) => Promise<(validationData: { products: ProductModel[] }) => Promise<void>>

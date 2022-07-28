import { ProductModel } from '@/domain/models';
import { UpdateProductUseCase } from '@/domain/use-cases';

export type UpdateProductValidation = (
  requestModel: UpdateProductUseCase.RequestModel,
) => Promise<(validationData: { products: ProductModel[] }) => Promise<void>>;

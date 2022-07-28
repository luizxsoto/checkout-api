import { CreateProductUseCase } from '@/domain/use-cases';

export type CreateProductValidation = (
  requestModel: CreateProductUseCase.RequestModel,
) => Promise<void>;

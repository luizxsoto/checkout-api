import { DbCreateProductUseCase } from '@/data/use-cases';
import { ProductModel, SessionModel } from '@/domain/models';
import { CreateProductUseCase } from '@/domain/use-cases';
import { KnexProductRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbCreateProductUseCase(session: SessionModel): CreateProductUseCase.UseCase {
  const repository = new KnexProductRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    CreateProductUseCase.RequestModel,
    { products: ProductModel[] }
  >();
  const useCase = new DbCreateProductUseCase(repository, validatorService);

  return useCase;
}

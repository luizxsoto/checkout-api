import { DbUpdateProductUseCase } from '@/data/use-cases';
import { ProductModel, SessionModel } from '@/domain/models';
import { UpdateProductUseCase } from '@/domain/use-cases';
import { KnexProductRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbUpdateProductUseCase(session: SessionModel): UpdateProductUseCase.UseCase {
  const repository = new KnexProductRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    UpdateProductUseCase.RequestModel,
    { products: ProductModel[] }
  >();
  const useCase = new DbUpdateProductUseCase(repository, repository, validatorService);

  return useCase;
}

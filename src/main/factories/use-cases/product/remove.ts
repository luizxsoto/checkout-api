import { DbRemoveProductUseCase } from '@/data/use-cases';
import { ProductModel, SessionModel } from '@/domain/models';
import { RemoveProductUseCase } from '@/domain/use-cases';
import { KnexProductRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbRemoveProductUseCase(session: SessionModel): RemoveProductUseCase.UseCase {
  const repository = new KnexProductRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    RemoveProductUseCase.RequestModel,
    { products: ProductModel[] }
  >();
  const useCase = new DbRemoveProductUseCase(repository, repository, validatorService);

  return useCase;
}

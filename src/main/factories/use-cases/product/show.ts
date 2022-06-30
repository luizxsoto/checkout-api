import { DbShowProductUseCase } from '@/data/use-cases';
import { ProductModel, SessionModel } from '@/domain/models';
import { ShowProductUseCase } from '@/domain/use-cases';
import { KnexProductRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbShowProductUseCase(session: SessionModel): ShowProductUseCase.UseCase {
  const repository = new KnexProductRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    ShowProductUseCase.RequestModel,
    { products: ProductModel[] }
  >();
  const useCase = new DbShowProductUseCase(repository, validatorService);

  return useCase;
}

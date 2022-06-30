import { DbListProductUseCase } from '@/data/use-cases';
import { SessionModel } from '@/domain/models';
import { ListProductUseCase } from '@/domain/use-cases';
import { KnexProductRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbListProductUseCase(session: SessionModel): ListProductUseCase.UseCase {
  const repository = new KnexProductRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    ListProductUseCase.RequestModel,
    Record<string, unknown[]>
  >();
  const useCase = new DbListProductUseCase(repository, validatorService);

  return useCase;
}

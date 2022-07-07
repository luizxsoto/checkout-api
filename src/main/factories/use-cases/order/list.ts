import { DbListOrderUseCase } from '@/data/use-cases';
import { SessionModel } from '@/domain/models';
import { ListOrderUseCase } from '@/domain/use-cases';
import { KnexOrderRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbListOrderUseCase(session: SessionModel): ListOrderUseCase.UseCase {
  const repository = new KnexOrderRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    ListOrderUseCase.RequestModel,
    Record<string, unknown[]>
  >();
  const useCase = new DbListOrderUseCase(repository, validatorService);

  return useCase;
}

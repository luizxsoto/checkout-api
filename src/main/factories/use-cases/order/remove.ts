import { DbRemoveOrderUseCase } from '@/data/use-cases';
import { OrderModel, SessionModel } from '@/domain/models';
import { RemoveOrderUseCase } from '@/domain/use-cases';
import { KnexOrderItemRepository, KnexOrderRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbRemoveOrderUseCase(session: SessionModel): RemoveOrderUseCase.UseCase {
  const repository = new KnexOrderRepository(session, knexConfig, new UUIDService());
  const orderItemRepository = new KnexOrderItemRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    RemoveOrderUseCase.RequestModel,
    { orders: OrderModel[] }
  >();
  const useCase = new DbRemoveOrderUseCase(
    repository,
    orderItemRepository,
    repository,
    validatorService,
  );

  return useCase;
}

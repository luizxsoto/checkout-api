import { DbShowOrderUseCase } from '@/data/use-cases';
import { OrderModel, SessionModel } from '@/domain/models';
import { ShowOrderUseCase } from '@/domain/use-cases';
import { KnexOrderItemRepository, KnexOrderRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbShowOrderUseCase(session: SessionModel): ShowOrderUseCase.UseCase {
  const repository = new KnexOrderRepository(session, knexConfig, new UUIDService());
  const orderItemRepository = new KnexOrderItemRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    ShowOrderUseCase.RequestModel,
    { orders: OrderModel[] }
  >();
  const useCase = new DbShowOrderUseCase(repository, orderItemRepository, validatorService);

  return useCase;
}

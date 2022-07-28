import { DbUpdateOrderUseCase } from '@/data/use-cases';
import { OrderModel, SessionModel, UserModel } from '@/domain/models';
import { UpdateOrderUseCase } from '@/domain/use-cases';
import { KnexOrderRepository, KnexUserRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbUpdateOrderUseCase(session: SessionModel): UpdateOrderUseCase.UseCase {
  const repository = new KnexOrderRepository(session, knexConfig, new UUIDService());
  const userRepository = new KnexUserRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    UpdateOrderUseCase.RequestModel,
    { orders: OrderModel[]; users: Omit<UserModel, 'password'>[] }
  >();
  const useCase = new DbUpdateOrderUseCase(
    repository,
    repository,
    userRepository,
    validatorService,
  );

  return useCase;
}

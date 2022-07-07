import { DbUpdateOrderUseCase } from '@/data/use-cases';
import { OrderModel, PaymentProfileModel, SessionModel } from '@/domain/models';
import { UpdateOrderUseCase } from '@/domain/use-cases';
import { KnexOrderRepository, KnexPaymentProfileRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbUpdateOrderUseCase(session: SessionModel): UpdateOrderUseCase.UseCase {
  const repository = new KnexOrderRepository(session, knexConfig, new UUIDService());
  const paymentProfileRepository = new KnexPaymentProfileRepository(
    session,
    knexConfig,
    new UUIDService(),
  );
  const validatorService = new VanillaValidatorService<
    UpdateOrderUseCase.RequestModel,
    { orders: OrderModel[]; paymentProfiles: Omit<PaymentProfileModel, 'data'>[] }
  >();
  const useCase = new DbUpdateOrderUseCase(
    repository,
    repository,
    paymentProfileRepository,
    validatorService,
  );

  return useCase;
}

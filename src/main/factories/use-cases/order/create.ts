import { DbCreateOrderUseCase } from '@/data/use-cases';
import { PaymentProfileModel, ProductModel, SessionModel } from '@/domain/models';
import { CreateOrderUseCase } from '@/domain/use-cases';
import {
  KnexOrderItemRepository,
  KnexOrderRepository,
  KnexPaymentProfileRepository,
  KnexProductRepository,
} from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbCreateOrderUseCase(session: SessionModel): CreateOrderUseCase.UseCase {
  const uuidService = new UUIDService();
  const repository = new KnexOrderRepository(session, knexConfig, uuidService);
  const orderItemRepository = new KnexOrderItemRepository(session, knexConfig, uuidService);
  const paymentProfileRepository = new KnexPaymentProfileRepository(
    session,
    knexConfig,
    uuidService,
  );
  const productRepository = new KnexProductRepository(session, knexConfig, uuidService);
  const validatorService = new VanillaValidatorService<
    CreateOrderUseCase.RequestModel,
    { paymentProfiles: Omit<PaymentProfileModel, 'data'>[]; products: ProductModel[] }
  >();
  const useCase = new DbCreateOrderUseCase(
    repository,
    orderItemRepository,
    paymentProfileRepository,
    productRepository,
    validatorService,
  );

  return useCase;
}

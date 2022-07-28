import { DbCreateOrderUseCase } from '@/data/use-cases';
import { ProductModel, SessionModel, UserModel } from '@/domain/models';
import { CreateOrderUseCase } from '@/domain/use-cases';
import {
  KnexOrderItemRepository,
  KnexOrderRepository,
  KnexProductRepository,
  KnexUserRepository,
} from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbCreateOrderUseCase(session: SessionModel): CreateOrderUseCase.UseCase {
  const uuidService = new UUIDService();
  const repository = new KnexOrderRepository(session, knexConfig, uuidService);
  const orderItemRepository = new KnexOrderItemRepository(session, knexConfig, uuidService);
  const userRepository = new KnexUserRepository(session, knexConfig, uuidService);
  const productRepository = new KnexProductRepository(session, knexConfig, uuidService);
  const validatorService = new VanillaValidatorService<
    CreateOrderUseCase.RequestModel,
    { users: Omit<UserModel, 'password'>[]; products: ProductModel[] }
  >();
  const useCase = new DbCreateOrderUseCase(
    repository,
    orderItemRepository,
    userRepository,
    productRepository,
    validatorService,
  );

  return useCase;
}

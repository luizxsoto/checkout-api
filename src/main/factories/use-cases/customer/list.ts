import { DbListCustomerUseCase } from '@/data/use-cases';
import { CustomerModel, SessionModel } from '@/domain/models';
import { ListCustomerUseCase } from '@/domain/use-cases';
import { KnexCustomerRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbListCustomerUseCase(session: SessionModel): ListCustomerUseCase.UseCase {
  const repository = new KnexCustomerRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    ListCustomerUseCase.RequestModel,
    { customers: CustomerModel[] }
  >();
  const useCase = new DbListCustomerUseCase(repository, validatorService);

  return useCase;
}

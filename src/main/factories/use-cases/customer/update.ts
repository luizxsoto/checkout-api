import { DbUpdateCustomerUseCase } from '@/data/use-cases';
import { CustomerModel, SessionModel } from '@/domain/models';
import { UpdateCustomerUseCase } from '@/domain/use-cases';
import { KnexCustomerRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbUpdateCustomerUseCase(session: SessionModel): UpdateCustomerUseCase.UseCase {
  const repository = new KnexCustomerRepository(knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    UpdateCustomerUseCase.RequestModel,
    { customers: CustomerModel[] }
  >();
  const useCase = new DbUpdateCustomerUseCase(session, repository, repository, validatorService);

  return useCase;
}

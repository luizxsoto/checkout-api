import { DbCreateCustomerUseCase } from '@/data/use-cases';
import { CustomerModel, SessionModel } from '@/domain/models';
import { CreateCustomerUseCase } from '@/domain/use-cases';
import { KnexCustomerRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbCreateCustomerUseCase(session: SessionModel): CreateCustomerUseCase.UseCase {
  const repository = new KnexCustomerRepository(knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    Partial<CreateCustomerUseCase.RequestModel>,
    { customers: CustomerModel[] }
  >();
  const useCase = new DbCreateCustomerUseCase(session, repository, repository, validatorService);

  return useCase;
}

import { DbShowCustomerUseCase } from '@/data/use-cases';
import { CustomerModel, SessionModel } from '@/domain/models';
import { ShowCustomerUseCase } from '@/domain/use-cases';
import { KnexCustomerRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbShowCustomerUseCase(session: SessionModel): ShowCustomerUseCase.UseCase {
  const repository = new KnexCustomerRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    Partial<ShowCustomerUseCase.RequestModel>,
    { customers: CustomerModel[] }
  >();
  const useCase = new DbShowCustomerUseCase(repository, validatorService);

  return useCase;
}

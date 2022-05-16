import { DbRemoveCustomerUseCase } from '@/data/use-cases';
import { CustomerModel } from '@/domain/models';
import { RemoveCustomerUseCase } from '@/domain/use-cases';
import { KnexCustomerRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbRemoveCustomerUseCase(): RemoveCustomerUseCase.UseCase {
  const repository = new KnexCustomerRepository(knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    RemoveCustomerUseCase.RequestModel,
    { customers: CustomerModel[] }
  >();
  const useCase = new DbRemoveCustomerUseCase(repository, repository, validatorService);

  return useCase;
}

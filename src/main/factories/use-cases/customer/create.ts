import { DbCreateCustomerUseCase } from '@/data/use-cases';
import { CreateCustomerUseCase } from '@/domain/use-cases';
import { KnexCustomerRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaCreateCustomerValidator } from '@/infra/validators';
import { knexConfig } from '@/main/config';

export function makeDbCreateCustomerUseCase(): CreateCustomerUseCase.UseCase {
  const repository = new KnexCustomerRepository(knexConfig, new UUIDService());
  const createCustomerValidator = new VanillaCreateCustomerValidator();
  const useCase = new DbCreateCustomerUseCase(repository, repository, createCustomerValidator);

  return useCase;
}

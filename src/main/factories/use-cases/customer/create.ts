import { DbCreateCustomerUseCase } from '@/data/use-cases';
import { CreateCustomerUseCase } from '@/domain/use-cases';
import { KnexCustomerRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbCreateCustomerUseCase(): CreateCustomerUseCase.UseCase {
  const repository = new KnexCustomerRepository(knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService();
  const useCase = new DbCreateCustomerUseCase(repository, repository, validatorService);

  return useCase;
}

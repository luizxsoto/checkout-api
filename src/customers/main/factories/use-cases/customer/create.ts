import { DbCreateCustomerUseCase } from '@/customers/data/use-cases';
import { CreateCustomerUseCase } from '@/customers/domain/use-cases';
import { KnexCustomerRepository } from '@/customers/infra/repositories';
import { knexConfig } from '@/shared/config';
import { UUIDService } from '@/shared/services';

export function makeDbCreateCustomerUseCase(): CreateCustomerUseCase.UseCase {
  const repository = new KnexCustomerRepository(knexConfig, new UUIDService());
  const useCase = new DbCreateCustomerUseCase(repository);

  return useCase;
}

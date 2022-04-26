import { DbCreateCustomerUseCase } from '@/data/use-cases';
import { CreateCustomerUseCase } from '@/domain/use-cases';
import { KnexCustomerRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { knexConfig } from '@/main/config';

export function makeDbCreateCustomerUseCase(): CreateCustomerUseCase.UseCase {
  const repository = new KnexCustomerRepository(knexConfig, new UUIDService());
  const useCase = new DbCreateCustomerUseCase(repository);

  return useCase;
}

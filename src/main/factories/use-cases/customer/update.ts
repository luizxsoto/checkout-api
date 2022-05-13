import { DbUpdateCustomerUseCase } from '@/data/use-cases';
import { CustomerModel } from '@/domain/models';
import { UpdateCustomerUseCase } from '@/domain/use-cases';
import { KnexCustomerRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbUpdateCustomerUseCase(): UpdateCustomerUseCase.UseCase {
  const repository = new KnexCustomerRepository(knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    UpdateCustomerUseCase.RequestModel,
    {
      customersById: () => Promise<CustomerModel[]>;
      customersByEmail: () => Promise<CustomerModel[]>;
    }
  >();
  const useCase = new DbUpdateCustomerUseCase(repository, repository, validatorService);

  return useCase;
}

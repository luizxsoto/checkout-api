import { CreateCustomerRepository } from '@/customers/data/repositories';
import { CreateCustomerUseCase } from '@/customers/domain/use-cases';

export class DbCreateCustomerUseCase implements CreateCustomerUseCase.UseCase {
  constructor(private readonly createCustomerRepository: CreateCustomerRepository.Repository) {}

  public async execute(
    requestModel: CreateCustomerUseCase.RequestModel,
  ): Promise<CreateCustomerUseCase.ResponseModel> {
    const repositoryResult = await this.createCustomerRepository.create(requestModel);

    return repositoryResult;
  }
}

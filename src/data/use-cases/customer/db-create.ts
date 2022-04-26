import { CreateCustomerRepository } from '@/data/contracts/repositories';
import { CreateCustomerUseCase } from '@/domain/use-cases';

export class DbCreateCustomerUseCase implements CreateCustomerUseCase.UseCase {
  constructor(private readonly createCustomerRepository: CreateCustomerRepository.Repository) {}

  public async execute(
    requestModel: CreateCustomerUseCase.RequestModel,
  ): Promise<CreateCustomerUseCase.ResponseModel> {
    const repositoryResult = await this.createCustomerRepository.create(requestModel);

    return repositoryResult;
  }
}

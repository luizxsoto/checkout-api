import { CreateCustomerRepository, FindByCustomerRepository } from '@/data/contracts/repositories';
import { CreateCustomerValidator } from '@/data/contracts/validators';
import { CreateCustomerUseCase } from '@/domain/use-cases';

export class DbCreateCustomerUseCase implements CreateCustomerUseCase.UseCase {
  constructor(
    private readonly createCustomerRepository: CreateCustomerRepository.Repository,
    private readonly findByCustomerRepository: FindByCustomerRepository.Repository,
    private readonly createCustomerValidator: CreateCustomerValidator.Validator,
  ) {}

  public async execute(
    requestModel: CreateCustomerUseCase.RequestModel,
  ): Promise<CreateCustomerUseCase.ResponseModel> {
    const findedCustomers = await this.findByCustomerRepository.findBy({
      email: requestModel.email,
    });

    const sanitizedRequestModel = this.createCustomerValidator.validate({
      requestModel,
      validatorData: { findedCustomers },
    });

    const repositoryResult = await this.createCustomerRepository.create(sanitizedRequestModel);

    return repositoryResult;
  }
}

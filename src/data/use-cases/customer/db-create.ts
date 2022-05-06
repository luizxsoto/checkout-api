import { CreateCustomerRepository, FindByCustomerRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { CustomerModel } from '@/domain/models';
import { CreateCustomerUseCase } from '@/domain/use-cases';

export class DbCreateCustomerUseCase implements CreateCustomerUseCase.UseCase {
  constructor(
    private readonly createCustomerRepository: CreateCustomerRepository.Repository,
    private readonly findByCustomerRepository: FindByCustomerRepository.Repository,
    private readonly validator: ValidatorService.Validator<
      CreateCustomerUseCase.RequestModel,
      { customers: () => Promise<CustomerModel[]> }
    >,
  ) {}

  public async execute(
    requestModel: CreateCustomerUseCase.RequestModel,
  ): Promise<CreateCustomerUseCase.ResponseModel> {
    await this.validateRequestModel(requestModel);

    const repositoryResult = await this.createCustomerRepository.create(requestModel);

    return repositoryResult;
  }

  private async validateRequestModel(
    requestModel: CreateCustomerUseCase.RequestModel,
  ): Promise<void> {
    await this.validator.validate({
      schema: {
        name: [
          this.validator.rules.required(),
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'name' }),
          this.validator.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          this.validator.rules.required(),
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'email' }),
          this.validator.rules.length({ minLength: 6, maxLength: 100 }),
          this.validator.rules.unique({
            dataEntity: 'customers',
            props: [{ modelKey: 'email', dataKey: 'email' }],
          }),
        ],
      },
      model: requestModel,
      data: {
        customers: () => this.findByCustomerRepository.findBy({ email: requestModel.email }),
      },
    });
  }
}

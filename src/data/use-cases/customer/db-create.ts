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
      { findedCustomers: CustomerModel[] }
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
    this.validator.validate({
      schema: {
        name: [
          this.validator.rules.required(),
          this.validator.rules.string({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          this.validator.rules.required(),
          this.validator.rules.string({ minLength: 6, maxLength: 100 }),
          this.validator.rules.email(),
          this.validator.rules.unique({
            dataEntity: 'findedCustomers',
            props: [{ modelKey: 'email', dataKey: 'email' }],
          }),
        ],
      },
      model: requestModel,
      data: {
        findedCustomers: await this.findByCustomerRepository.findBy({
          email: requestModel.email,
        }),
      },
    });
  }
}

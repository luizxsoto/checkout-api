import { FindByCustomerRepository, UpdateCustomerRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { CustomerModel } from '@/domain/models';
import { UpdateCustomerUseCase } from '@/domain/use-cases';

export class DbUpdateCustomerUseCase implements UpdateCustomerUseCase.UseCase {
  constructor(
    private readonly updateCustomerRepository: UpdateCustomerRepository.Repository,
    private readonly findByCustomerRepository: FindByCustomerRepository.Repository,
    private readonly validator: ValidatorService.Validator<
      UpdateCustomerUseCase.RequestModel,
      { customers: () => Promise<CustomerModel[]> }
    >,
  ) {}

  public async execute(
    requestModel: UpdateCustomerUseCase.RequestModel,
  ): Promise<UpdateCustomerUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const validatorData = await this.validateRequestModel(sanitizedRequestModel);

    const repositoryResult = await this.updateCustomerRepository.update(
      { id: sanitizedRequestModel.id },
      sanitizedRequestModel,
    );

    const findedCustomer = validatorData.customers.find(
      (customer) => customer.id === sanitizedRequestModel.id,
    ) as CustomerModel;

    return { ...findedCustomer, ...sanitizedRequestModel, ...repositoryResult };
  }

  private sanitizeRequestModel(
    requestModel: UpdateCustomerUseCase.RequestModel,
  ): UpdateCustomerUseCase.RequestModel {
    return {
      id: requestModel.id,
      name: requestModel.name,
      email: requestModel.email,
    };
  }

  private async validateRequestModel(
    requestModel: UpdateCustomerUseCase.RequestModel,
  ): Promise<{ customers: CustomerModel[] }> {
    return this.validator.validate({
      schema: {
        id: [
          this.validator.rules.required(),
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'uuidV4' }),
          this.validator.rules.exists({
            dataEntity: 'customers',
            props: [{ modelKey: 'id', dataKey: 'id' }],
          }),
        ],
        name: [
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'name' }),
          this.validator.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'email' }),
          this.validator.rules.length({ minLength: 6, maxLength: 100 }),
          this.validator.rules.unique({
            dataEntity: 'customers',
            ignoreProps: [{ modelKey: 'id', dataKey: 'id' }],
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

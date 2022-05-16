import { FindByCustomerRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { CustomerModel } from '@/domain/models';
import { ListCustomerUseCase } from '@/domain/use-cases';

export class DbListCustomerUseCase implements ListCustomerUseCase.UseCase {
  constructor(
    private readonly findByCustomerRepository: FindByCustomerRepository.Repository,
    private readonly validator: ValidatorService.Validator<
      ListCustomerUseCase.RequestModel,
      { customers: CustomerModel[] }
    >,
  ) {}

  public async execute(
    requestModel: ListCustomerUseCase.RequestModel,
  ): Promise<ListCustomerUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    await this.validateRequestModel(sanitizedRequestModel);

    const customersBy = await this.findByCustomerRepository.findBy(sanitizedRequestModel);

    return customersBy;
  }

  private sanitizeRequestModel(
    requestModel: ListCustomerUseCase.RequestModel,
  ): ListCustomerUseCase.RequestModel {
    const sanitizedRequestModel: ListCustomerUseCase.RequestModel = {};

    if (requestModel.name) sanitizedRequestModel.name = requestModel.name;
    if (requestModel.email) sanitizedRequestModel.email = requestModel.email;

    return sanitizedRequestModel;
  }

  private async validateRequestModel(
    requestModel: ListCustomerUseCase.RequestModel,
  ): Promise<void> {
    await this.validator.validate({
      schema: {
        name: [
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'name' }),
          this.validator.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'email' }),
          this.validator.rules.length({ minLength: 6, maxLength: 100 }),
        ],
      },
      model: requestModel,
      data: { customers: [] },
    });
  }
}

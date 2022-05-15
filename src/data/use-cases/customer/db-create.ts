import { CreateCustomerRepository, FindByCustomerRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { CustomerModel } from '@/domain/models';
import { CreateCustomerUseCase } from '@/domain/use-cases';

export class DbCreateCustomerUseCase implements CreateCustomerUseCase.UseCase {
  constructor(
    private readonly createCustomerRepository: CreateCustomerRepository.Repository,
    private readonly findByCustomerRepository: FindByCustomerRepository.Repository,
    private readonly validator: ValidatorService.Validator<
      Partial<CreateCustomerUseCase.RequestModel>,
      { customers: CustomerModel[] }
    >,
  ) {}

  public async execute(
    requestModel: CreateCustomerUseCase.RequestModel,
  ): Promise<CreateCustomerUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const customers = await this.findByCustomerRepository.findBy({
      email: sanitizedRequestModel.email,
    });

    await restValidation({ customers });

    const repositoryResult = await this.createCustomerRepository.create(sanitizedRequestModel);

    return { ...sanitizedRequestModel, ...repositoryResult };
  }

  private sanitizeRequestModel(
    requestModel: CreateCustomerUseCase.RequestModel,
  ): CreateCustomerUseCase.RequestModel {
    return {
      name: requestModel.name,
      email: requestModel.email,
    };
  }

  private async validateRequestModel(
    requestModel: CreateCustomerUseCase.RequestModel,
  ): Promise<(validationData: { customers: CustomerModel[] }) => Promise<void>> {
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
        ],
      },
      model: requestModel,
      data: { customers: [] },
    });
    return (validationData) =>
      this.validator.validate({
        schema: {
          name: [],
          email: [
            this.validator.rules.unique({
              dataEntity: 'customers',
              props: [{ modelKey: 'email', dataKey: 'email' }],
            }),
          ],
        },
        model: requestModel,
        data: validationData,
      });
  }
}

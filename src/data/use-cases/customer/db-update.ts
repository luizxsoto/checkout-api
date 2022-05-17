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
      { customers: CustomerModel[] }
    >,
  ) {}

  public async execute(
    requestModel: UpdateCustomerUseCase.RequestModel,
  ): Promise<UpdateCustomerUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const findedCustomers = await this.findByCustomerRepository.findBy([
      { id: sanitizedRequestModel.id },
      { email: sanitizedRequestModel.email },
    ]);

    await restValidation({ customers: [...findedCustomers] });

    const repositoryResult = await this.updateCustomerRepository.update(
      { id: sanitizedRequestModel.id },
      sanitizedRequestModel,
    );

    const findedCustomerById = findedCustomers.find(
      (findedCustomer) => findedCustomer.id === sanitizedRequestModel.id,
    );

    return { ...findedCustomerById, ...sanitizedRequestModel, ...repositoryResult };
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
  ): Promise<(validationData: { customers: CustomerModel[] }) => Promise<void>> {
    await this.validator.validate({
      schema: {
        id: [
          this.validator.rules.required(),
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'uuidV4' }),
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
        ],
      },
      model: requestModel,
      data: { customers: [] },
    });
    return (validationData) =>
      this.validator.validate({
        schema: {
          id: [
            this.validator.rules.exists({
              dataEntity: 'customers',
              props: [{ modelKey: 'id', dataKey: 'id' }],
            }),
          ],
          name: [],
          email: [
            this.validator.rules.unique({
              dataEntity: 'customers',
              ignoreProps: [{ modelKey: 'id', dataKey: 'id' }],
              props: [{ modelKey: 'email', dataKey: 'email' }],
            }),
          ],
        },
        model: requestModel,
        data: validationData,
      });
  }
}

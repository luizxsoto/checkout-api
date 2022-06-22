import { FindByCustomerRepository, UpdateCustomerRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { CustomerModel } from '@/domain/models';
import { UpdateCustomerUseCase } from '@/domain/use-cases';

export class DbUpdateCustomerUseCase implements UpdateCustomerUseCase.UseCase {
  constructor(
    private readonly updateCustomerRepository: UpdateCustomerRepository.Repository,
    private readonly findByCustomerRepository: FindByCustomerRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      UpdateCustomerUseCase.RequestModel,
      { customers: CustomerModel[] }
    >,
  ) {}

  public async execute(
    requestModel: UpdateCustomerUseCase.RequestModel,
  ): Promise<UpdateCustomerUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const filters: Partial<CustomerModel>[] = [{ id: sanitizedRequestModel.id }];

    if (sanitizedRequestModel.email) filters.push({ email: sanitizedRequestModel.email });

    const findedCustomers = await this.findByCustomerRepository.findBy(filters);

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
    await this.validatorService.validate({
      schema: {
        id: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        name: [
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'name' }),
          this.validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'email' }),
          this.validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
      },
      model: requestModel,
      data: { customers: [] },
    });
    return (validationData) =>
      this.validatorService.validate({
        schema: {
          id: [
            this.validatorService.rules.exists({
              dataEntity: 'customers',
              props: [{ modelKey: 'id', dataKey: 'id' }],
            }),
          ],
          name: [],
          email: [
            this.validatorService.rules.unique({
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

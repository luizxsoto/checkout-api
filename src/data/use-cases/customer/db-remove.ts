import { FindByCustomerRepository, RemoveCustomerRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { CustomerModel } from '@/domain/models';
import { RemoveCustomerUseCase } from '@/domain/use-cases';

export class DbRemoveCustomerUseCase implements RemoveCustomerUseCase.UseCase {
  constructor(
    private readonly removeCustomerRepository: RemoveCustomerRepository.Repository,
    private readonly findByCustomerRepository: FindByCustomerRepository.Repository,
    private readonly validator: ValidatorService.Validator<
      RemoveCustomerUseCase.RequestModel,
      { customers: CustomerModel[] }
    >,
  ) {}

  public async execute(
    requestModel: RemoveCustomerUseCase.RequestModel,
  ): Promise<RemoveCustomerUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const customersById = await this.findByCustomerRepository.findBy({
      id: sanitizedRequestModel.id,
    });

    await restValidation({ customers: customersById });

    const repositoryResult = await this.removeCustomerRepository.remove(sanitizedRequestModel);

    return { ...customersById[0], ...sanitizedRequestModel, ...repositoryResult };
  }

  private sanitizeRequestModel(
    requestModel: RemoveCustomerUseCase.RequestModel,
  ): RemoveCustomerUseCase.RequestModel {
    return { id: requestModel.id };
  }

  private async validateRequestModel(
    requestModel: RemoveCustomerUseCase.RequestModel,
  ): Promise<(validationData: { customers: CustomerModel[] }) => Promise<void>> {
    await this.validator.validate({
      schema: {
        id: [
          this.validator.rules.required(),
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'uuidV4' }),
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
        },
        model: requestModel,
        data: validationData,
      });
  }
}

import { FindByCustomerRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { CustomerModel } from '@/domain/models';
import { ShowCustomerUseCase } from '@/domain/use-cases';

export class DbShowCustomerUseCase implements ShowCustomerUseCase.UseCase {
  constructor(
    private readonly findByCustomerRepository: FindByCustomerRepository.Repository,
    private readonly validator: ValidatorService.Validator<
      ShowCustomerUseCase.RequestModel,
      { customers: CustomerModel[] }
    >,
  ) {}

  public async execute(
    requestModel: ShowCustomerUseCase.RequestModel,
  ): Promise<ShowCustomerUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const customersById = await this.findByCustomerRepository.findBy({
      id: sanitizedRequestModel.id,
    });

    await restValidation({ customers: customersById });

    return { ...customersById[0], ...sanitizedRequestModel };
  }

  private sanitizeRequestModel(
    requestModel: ShowCustomerUseCase.RequestModel,
  ): ShowCustomerUseCase.RequestModel {
    return { id: requestModel.id };
  }

  private async validateRequestModel(
    requestModel: ShowCustomerUseCase.RequestModel,
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

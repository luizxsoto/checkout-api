import { FindByCustomerRepository, RemoveCustomerRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { CustomerModel } from '@/domain/models';
import { RemoveCustomerUseCase } from '@/domain/use-cases';

export class DbRemoveCustomerUseCase implements RemoveCustomerUseCase.UseCase {
  constructor(
    private readonly removeCustomerRepository: RemoveCustomerRepository.Repository,
    private readonly findByCustomerRepository: FindByCustomerRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      RemoveCustomerUseCase.RequestModel,
      { customers: CustomerModel[] }
    >,
  ) {}

  public async execute(
    requestModel: RemoveCustomerUseCase.RequestModel,
  ): Promise<RemoveCustomerUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const customers = await this.findByCustomerRepository.findBy([
      { id: sanitizedRequestModel.id },
    ]);

    await restValidation({ customers });

    const [customerRemoved] = await this.removeCustomerRepository.remove(sanitizedRequestModel);

    return { ...customers[0], ...sanitizedRequestModel, ...customerRemoved };
  }

  private sanitizeRequestModel(
    requestModel: RemoveCustomerUseCase.RequestModel,
  ): RemoveCustomerUseCase.RequestModel {
    return {
      id: requestModel.id,
    };
  }

  private async validateRequestModel(
    requestModel: RemoveCustomerUseCase.RequestModel,
  ): Promise<(validationData: { customers: CustomerModel[] }) => Promise<void>> {
    await this.validatorService.validate({
      schema: {
        id: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
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
        },
        model: requestModel,
        data: validationData,
      });
  }
}

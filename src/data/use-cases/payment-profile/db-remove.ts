import {
  FindByPaymentProfileRepository,
  RemovePaymentProfileRepository,
} from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { PaymentProfileModel } from '@/domain/models';
import { RemovePaymentProfileUseCase } from '@/domain/use-cases';

export class DbRemovePaymentProfileUseCase implements RemovePaymentProfileUseCase.UseCase {
  constructor(
    private readonly removePaymentProfileRepository: RemovePaymentProfileRepository.Repository,
    private readonly findByPaymentProfileRepository: FindByPaymentProfileRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      RemovePaymentProfileUseCase.RequestModel,
      { paymentProfiles: Omit<PaymentProfileModel, 'number' | 'cvv'>[] }
    >,
  ) {}

  public async execute(
    requestModel: RemovePaymentProfileUseCase.RequestModel,
  ): Promise<RemovePaymentProfileUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const paymentProfiles = await this.findByPaymentProfileRepository.findBy(
      [sanitizedRequestModel],
      true,
    );

    await restValidation({ paymentProfiles });

    const [paymentProfileRemoved] = await this.removePaymentProfileRepository.remove(
      sanitizedRequestModel,
    );

    const responseModel = {
      ...paymentProfiles[0],
      ...sanitizedRequestModel,
      ...paymentProfileRemoved,
    };
    Reflect.deleteProperty(responseModel, 'cvv');
    Reflect.deleteProperty(responseModel, 'number');

    return responseModel;
  }

  private sanitizeRequestModel(
    requestModel: RemovePaymentProfileUseCase.RequestModel,
  ): RemovePaymentProfileUseCase.RequestModel {
    return {
      id: requestModel.id,
    };
  }

  private async validateRequestModel(
    requestModel: RemovePaymentProfileUseCase.RequestModel,
  ): Promise<
    (validationData: {
      paymentProfiles: Omit<PaymentProfileModel, 'number' | 'cvv'>[];
    }) => Promise<void>
  > {
    await this.validatorService.validate({
      schema: {
        id: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
      },
      model: requestModel,
      data: { paymentProfiles: [] },
    });
    return (validationData) =>
      this.validatorService.validate({
        schema: {
          id: [
            this.validatorService.rules.exists({
              dataEntity: 'paymentProfiles',
              props: [{ modelKey: 'id', dataKey: 'id' }],
            }),
          ],
        },
        model: requestModel,
        data: validationData,
      });
  }
}

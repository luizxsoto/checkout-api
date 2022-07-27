import { FindByPaymentProfileRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { PaymentProfileModel } from '@/domain/models';
import { ShowPaymentProfileUseCase } from '@/domain/use-cases';

export class DbShowPaymentProfileUseCase implements ShowPaymentProfileUseCase.UseCase {
  constructor(
    private readonly findByPaymentProfileRepository: FindByPaymentProfileRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      ShowPaymentProfileUseCase.RequestModel,
      { paymentProfiles: Omit<PaymentProfileModel, 'number' | 'cvv'>[] }
    >,
  ) {}

  public async execute(
    requestModel: ShowPaymentProfileUseCase.RequestModel,
  ): Promise<ShowPaymentProfileUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const paymentProfiles = await this.findByPaymentProfileRepository.findBy(
      [sanitizedRequestModel],
      true,
    );

    await restValidation({ paymentProfiles });

    return { ...paymentProfiles[0], ...sanitizedRequestModel };
  }

  private sanitizeRequestModel(
    requestModel: ShowPaymentProfileUseCase.RequestModel,
  ): ShowPaymentProfileUseCase.RequestModel {
    return { id: requestModel.id };
  }

  private async validateRequestModel(
    requestModel: ShowPaymentProfileUseCase.RequestModel,
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

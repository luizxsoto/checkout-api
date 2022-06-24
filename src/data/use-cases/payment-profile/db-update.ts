import {
  FindByPaymentProfileRepository,
  UpdatePaymentProfileRepository,
} from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { Rule } from '@/data/contracts/services/validator';
import { PaymentProfileModel } from '@/domain/models';
import { UpdatePaymentProfileUseCase } from '@/domain/use-cases';

export class DbUpdatePaymentProfileUseCase implements UpdatePaymentProfileUseCase.UseCase {
  constructor(
    private readonly updatePaymentProfileRepository: UpdatePaymentProfileRepository.Repository,
    private readonly findByPaymentProfileRepository: FindByPaymentProfileRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      UpdatePaymentProfileUseCase.RequestModel,
      { paymentProfiles: PaymentProfileModel[] }
    >,
  ) {}

  public async execute(
    requestModel: UpdatePaymentProfileUseCase.RequestModel,
  ): Promise<UpdatePaymentProfileUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const paymentProfiles = await this.findByPaymentProfileRepository.findBy([
      { customerId: sanitizedRequestModel.customerId },
    ]);

    await restValidation({ paymentProfiles });

    const [paymentProfileUpdated] = await this.updatePaymentProfileRepository.update(
      { id: sanitizedRequestModel.id },
      sanitizedRequestModel,
    );

    const findedPaymentProfileById = paymentProfiles.find(
      (paymentProfile) => paymentProfile.id === sanitizedRequestModel.id,
    );

    return { ...findedPaymentProfileById, ...sanitizedRequestModel, ...paymentProfileUpdated };
  }

  private sanitizeRequestModel(
    requestModel: UpdatePaymentProfileUseCase.RequestModel,
  ): UpdatePaymentProfileUseCase.RequestModel {
    return {
      id: requestModel.id,
      customerId: requestModel.customerId,
      type: requestModel.type,
      data: requestModel.data,
    };
  }

  private async validateRequestModel(
    requestModel: UpdatePaymentProfileUseCase.RequestModel,
  ): Promise<(validationData: { paymentProfiles: PaymentProfileModel[] }) => Promise<void>> {
    const data: Rule[] = [this.validatorService.rules.required()];
    if (requestModel.type === 'CARD_PAYMENT') {
      data.push(
        this.validatorService.rules.object({
          schema: {
            type: [
              this.validatorService.rules.required(),
              this.validatorService.rules.string(),
              this.validatorService.rules.in({ values: ['CREDIT', 'DEBIT'] }),
            ],
            brand: [
              this.validatorService.rules.required(),
              this.validatorService.rules.string(),
              this.validatorService.rules.length({ minLength: 1, maxLength: 15 }),
            ],
            holderName: [
              this.validatorService.rules.required(),
              this.validatorService.rules.string(),
              this.validatorService.rules.length({ minLength: 1, maxLength: 15 }),
            ],
            cardNumber: [
              this.validatorService.rules.required(),
              this.validatorService.rules.string(),
              this.validatorService.rules.length({ minLength: 16, maxLength: 16 }),
            ],
            cardCVV: [
              this.validatorService.rules.required(),
              this.validatorService.rules.string(),
              this.validatorService.rules.length({ minLength: 3, maxLength: 3 }),
            ],
            expiryMonth: [
              this.validatorService.rules.required(),
              this.validatorService.rules.string(),
              this.validatorService.rules.min({ value: 1 }),
              this.validatorService.rules.max({ value: 12 }),
            ],
            expiryYear: [
              this.validatorService.rules.required(),
              this.validatorService.rules.string(),
              this.validatorService.rules.min({ value: 1 }),
              this.validatorService.rules.max({ value: 9999 }),
            ],
          },
        }),
      );
    }
    if (requestModel.type === 'PHONE_PAYMENT') {
      data.push(
        this.validatorService.rules.object({
          schema: {
            countryCode: [
              this.validatorService.rules.required(),
              this.validatorService.rules.string(),
              this.validatorService.rules.length({ minLength: 1, maxLength: 4 }),
            ],
            areaCode: [
              this.validatorService.rules.required(),
              this.validatorService.rules.string(),
              this.validatorService.rules.length({ minLength: 1, maxLength: 4 }),
            ],
            number: [
              this.validatorService.rules.required(),
              this.validatorService.rules.string(),
              this.validatorService.rules.length({ minLength: 1, maxLength: 10 }),
            ],
          },
        }),
      );
    }
    await this.validatorService.validate({
      schema: {
        id: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        customerId: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        type: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.in({ values: ['CARD_PAYMENT', 'PHONE_PAYMENT'] }),
        ],
        data,
      },
      model: requestModel,
      data: { paymentProfiles: [] },
    });
    return (validationData) => {
      return this.validatorService.validate({
        schema: {
          id: [
            this.validatorService.rules.exists({
              dataEntity: 'paymentProfiles',
              props: [
                { modelKey: 'id', dataKey: 'id' },
                { modelKey: 'customerId', dataKey: 'customerId' },
              ],
            }),
          ],
          customerId: [
            this.validatorService.rules.exists({
              dataEntity: 'paymentProfiles',
              props: [
                { modelKey: 'id', dataKey: 'id' },
                { modelKey: 'customerId', dataKey: 'customerId' },
              ],
            }),
          ],
          type: [],
          data: [
            this.validatorService.rules.unique({
              dataEntity: 'paymentProfiles',
              ignoreProps: [{ modelKey: 'id', dataKey: 'id' }],
              props: [
                { modelKey: 'data.type', dataKey: 'data.type' },
                { modelKey: 'data.brand', dataKey: 'data.brand' },
                { modelKey: 'data.cardNumber', dataKey: 'data.cardNumber' },
                { modelKey: 'data.expiryMonth', dataKey: 'data.expiryMonth' },
                { modelKey: 'data.expiryYear', dataKey: 'data.expiryYear' },
              ],
            }),
          ],
        },
        model: requestModel,
        data: validationData,
      });
    };
  }
}

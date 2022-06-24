import {
  CreatePaymentProfileRepository,
  FindByCustomerRepository,
  FindByPaymentProfileRepository,
} from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { Rule } from '@/data/contracts/services/validator';
import { CustomerModel, PaymentProfileModel } from '@/domain/models';
import { CreatePaymentProfileUseCase } from '@/domain/use-cases';

export class DbCreatePaymentProfileUseCase implements CreatePaymentProfileUseCase.UseCase {
  constructor(
    private readonly createPaymentProfileRepository: CreatePaymentProfileRepository.Repository,
    private readonly findByPaymentProfileRepository: FindByPaymentProfileRepository.Repository,
    private readonly findByCustomerRepository: FindByCustomerRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      CreatePaymentProfileUseCase.RequestModel,
      {
        customers: CustomerModel[];
        paymentProfiles: PaymentProfileModel[];
      }
    >,
  ) {}

  public async execute(
    requestModel: CreatePaymentProfileUseCase.RequestModel,
  ): Promise<CreatePaymentProfileUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const customers = await this.findByCustomerRepository.findBy([
      { id: sanitizedRequestModel.customerId },
    ]);

    const paymentProfiles = await this.findByPaymentProfileRepository.findBy([
      { customerId: sanitizedRequestModel.customerId },
    ]);

    await restValidation({ customers, paymentProfiles });

    const paymentProfileCreated = await this.createPaymentProfileRepository.create(
      sanitizedRequestModel,
    );

    return { ...sanitizedRequestModel, ...paymentProfileCreated };
  }

  private sanitizeRequestModel(
    requestModel: CreatePaymentProfileUseCase.RequestModel,
  ): CreatePaymentProfileUseCase.RequestModel {
    return {
      customerId: requestModel.customerId,
      type: requestModel.type,
      data: requestModel.data,
    };
  }

  private async validateRequestModel(
    requestModel: CreatePaymentProfileUseCase.RequestModel,
  ): Promise<
    (validationData: {
      customers: CustomerModel[];
      paymentProfiles: PaymentProfileModel[];
    }) => Promise<void>
  > {
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
      data: { customers: [], paymentProfiles: [] },
    });
    return (validationData) => {
      return this.validatorService.validate({
        schema: {
          customerId: [
            this.validatorService.rules.exists({
              dataEntity: 'customers',
              props: [{ modelKey: 'customerId', dataKey: 'id' }],
            }),
          ],
          type: [],
          data: [
            this.validatorService.rules.unique({
              dataEntity: 'paymentProfiles',
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

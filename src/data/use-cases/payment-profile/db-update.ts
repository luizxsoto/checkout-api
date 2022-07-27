import { Hasher } from '@/data/contracts/cryptography';
import {
  FindByPaymentProfileRepository,
  UpdatePaymentProfileRepository,
} from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { PaymentProfileModel } from '@/domain/models';
import { UpdatePaymentProfileUseCase } from '@/domain/use-cases';

export class DbUpdatePaymentProfileUseCase implements UpdatePaymentProfileUseCase.UseCase {
  constructor(
    private readonly updatePaymentProfileRepository: UpdatePaymentProfileRepository.Repository,
    private readonly findByPaymentProfileRepository: FindByPaymentProfileRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      UpdatePaymentProfileUseCase.RequestModel,
      { paymentProfiles: Omit<PaymentProfileModel, 'number' | 'cvv'>[] }
    >,
    private readonly hasher: Hasher,
  ) {}

  public async execute(
    requestModel: UpdatePaymentProfileUseCase.RequestModel,
  ): Promise<UpdatePaymentProfileUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const paymentProfiles = await this.findByPaymentProfileRepository.findBy(
      [{ userId: sanitizedRequestModel.userId }],
      true,
    );

    const requestModelWithSanitizedData = await this.sanitizeData(sanitizedRequestModel);

    await restValidation(requestModelWithSanitizedData, { paymentProfiles });

    const [paymentProfileUpdated] = await this.updatePaymentProfileRepository.update(
      { id: requestModelWithSanitizedData.id },
      requestModelWithSanitizedData,
    );

    const findedPaymentProfileById = paymentProfiles.find(
      (paymentProfile) => paymentProfile.id === requestModelWithSanitizedData.id,
    ) as PaymentProfileModel;

    const responseModel = {
      ...findedPaymentProfileById,
      ...requestModelWithSanitizedData,
      ...paymentProfileUpdated,
    };
    Reflect.deleteProperty(responseModel, 'cvv');
    Reflect.deleteProperty(responseModel, 'number');

    return responseModel;
  }

  private sanitizeRequestModel(
    requestModel: UpdatePaymentProfileUseCase.RequestModel,
  ): UpdatePaymentProfileUseCase.RequestModel {
    const sanitizedRequestModel = {
      id: requestModel.id,
      userId: requestModel.userId,
      type: requestModel.type,
      brand: requestModel.brand,
      holderName: requestModel.holderName,
      number: requestModel.number,
      cvv: requestModel.cvv,
      expiryMonth: requestModel.expiryMonth,
      expiryYear: requestModel.expiryYear,
    };

    return sanitizedRequestModel;
  }

  private async sanitizeData(
    requestModel: UpdatePaymentProfileUseCase.RequestModel,
  ): Promise<Omit<PaymentProfileModel, 'createUserId' | 'createdAt'>> {
    const requestModelWithSanitizedData = {
      ...requestModel,
      number: await this.hasher.hash(requestModel.number),
      firstSix: requestModel.number.slice(0, 6),
      lastFour: requestModel.number.slice(-4),
      cvv: await this.hasher.hash(requestModel.cvv),
    };

    return requestModelWithSanitizedData;
  }

  private async validateRequestModel(
    requestModel: UpdatePaymentProfileUseCase.RequestModel,
  ): Promise<
    (
      sanitizedRequestModel: Omit<PaymentProfileModel, 'createUserId' | 'createdAt'>,
      validationData: { paymentProfiles: Omit<PaymentProfileModel, 'number' | 'cvv'>[] },
    ) => Promise<void>
  > {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    await this.validatorService.validate({
      schema: {
        id: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        userId: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        type: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.in({ values: ['CREDIT', 'DEBIT'] }),
        ],
        brand: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.length({ minLength: 1, maxLength: 20 }),
        ],
        holderName: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.length({ minLength: 1, maxLength: 25 }),
        ],
        number: [
          this.validatorService.rules.required(),
          this.validatorService.rules.integerString(),
          this.validatorService.rules.length({ minLength: 16, maxLength: 16 }),
        ],
        cvv: [
          this.validatorService.rules.required(),
          this.validatorService.rules.integerString(),
          this.validatorService.rules.length({ minLength: 3, maxLength: 3 }),
        ],
        expiryMonth: [
          this.validatorService.rules.required(),
          this.validatorService.rules.integer(),
          this.validatorService.rules.min({
            value: requestModel.expiryYear <= currentYear ? currentMonth : 1,
          }),
          this.validatorService.rules.max({ value: 12 }),
        ],
        expiryYear: [
          this.validatorService.rules.required(),
          this.validatorService.rules.integer(),
          this.validatorService.rules.min({ value: currentYear }),
          this.validatorService.rules.max({ value: 9999 }),
        ],
      },
      model: requestModel,
      data: { paymentProfiles: [] },
    });
    return (sanitizedRequestModel, validationData) => {
      const uniqueValidation = [
        this.validatorService.rules.unique({
          dataEntity: 'paymentProfiles',
          ignoreProps: [{ modelKey: 'id', dataKey: 'id' }],
          props: [
            { modelKey: 'type', dataKey: 'type' },
            { modelKey: 'brand', dataKey: 'brand' },
            { modelKey: 'firstSix', dataKey: 'firstSix' },
            { modelKey: 'lastFour', dataKey: 'lastFour' },
            { modelKey: 'expiryMonth', dataKey: 'expiryMonth' },
            { modelKey: 'expiryYear', dataKey: 'expiryYear' },
          ],
        }),
      ];
      return this.validatorService.validate({
        schema: {
          id: [
            this.validatorService.rules.exists({
              dataEntity: 'paymentProfiles',
              props: [
                { modelKey: 'id', dataKey: 'id' },
                { modelKey: 'userId', dataKey: 'userId' },
              ],
            }),
          ],
          userId: [
            this.validatorService.rules.exists({
              dataEntity: 'paymentProfiles',
              props: [
                { modelKey: 'id', dataKey: 'id' },
                { modelKey: 'userId', dataKey: 'userId' },
              ],
            }),
          ],
          type: uniqueValidation,
          brand: uniqueValidation,
          holderName: [],
          number: uniqueValidation,
          cvv: [],
          expiryMonth: uniqueValidation,
          expiryYear: uniqueValidation,
        },
        model: sanitizedRequestModel,
        data: validationData,
      });
    };
  }
}

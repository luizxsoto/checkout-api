import { Hasher } from '@/data/contracts/cryptography';
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
      {
        paymentProfiles: (Omit<PaymentProfileModel, 'data'> & {
          data: Omit<PaymentProfileModel['data'], 'number' | 'cvv'> & { number?: string };
        })[];
      }
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

    const requestModelWithSanitizedData = {
      ...sanitizedRequestModel,
      data: await this.sanitizeData(sanitizedRequestModel),
    };

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
      data: {
        ...findedPaymentProfileById.data,
        ...requestModelWithSanitizedData.data,
        ...paymentProfileUpdated.data,
      },
    };
    Reflect.deleteProperty(responseModel.data, 'cvv');
    if (responseModel.paymentMethod === 'CARD_PAYMENT') {
      Reflect.deleteProperty(responseModel.data, 'number');
    }

    return responseModel;
  }

  private sanitizeRequestModel(
    requestModel: UpdatePaymentProfileUseCase.RequestModel,
  ): UpdatePaymentProfileUseCase.RequestModel {
    const sanitizedRequestModel = {
      id: requestModel.id,
      userId: requestModel.userId,
      paymentMethod: requestModel.paymentMethod,
      data: requestModel.data,
    };

    if (
      requestModel.data &&
      typeof requestModel.data === 'object' &&
      !Array.isArray(requestModel.data)
    ) {
      sanitizedRequestModel.data = <PaymentProfileModel['data']>{};
      if (requestModel.paymentMethod === 'CARD_PAYMENT') {
        const cardPaymentData = requestModel.data as PaymentProfileModel<'CARD_PAYMENT'>['data'];
        sanitizedRequestModel.data = <PaymentProfileModel<'CARD_PAYMENT'>['data']>{
          type: cardPaymentData.type,
          brand: cardPaymentData.brand,
          holderName: cardPaymentData.holderName,
          number: cardPaymentData.number,
          cvv: cardPaymentData.cvv,
          expiryMonth: cardPaymentData.expiryMonth,
          expiryYear: cardPaymentData.expiryYear,
        };
      }
      if (requestModel.paymentMethod === 'PHONE_PAYMENT') {
        const phonePaymentData = requestModel.data as PaymentProfileModel<'PHONE_PAYMENT'>['data'];
        sanitizedRequestModel.data = <PaymentProfileModel<'PHONE_PAYMENT'>['data']>{
          countryCode: phonePaymentData.countryCode,
          areaCode: phonePaymentData.areaCode,
          number: phonePaymentData.number,
        };
      }
    }

    return sanitizedRequestModel;
  }

  private async sanitizeData(
    requestModel: UpdatePaymentProfileUseCase.RequestModel,
  ): Promise<PaymentProfileModel['data']> {
    let sanitizedData = requestModel.data as PaymentProfileModel['data'];

    if (requestModel.paymentMethod === 'CARD_PAYMENT') {
      const cardPaymentData = requestModel.data as PaymentProfileModel<'CARD_PAYMENT'>['data'];
      sanitizedData = <PaymentProfileModel<'CARD_PAYMENT'>['data']>{
        ...sanitizedData,
        number: await this.hasher.hash(cardPaymentData.number),
        firstSix: cardPaymentData.number.slice(0, 6),
        lastFour: cardPaymentData.number.slice(-4),
        cvv: await this.hasher.hash(cardPaymentData.cvv),
      };
    }

    return sanitizedData;
  }

  private async validateRequestModel(
    requestModel: UpdatePaymentProfileUseCase.RequestModel,
  ): Promise<
    (
      sanitizedRequestModel: Omit<PaymentProfileModel, 'createUserId' | 'createdAt'>,
      validationData: {
        paymentProfiles: (Omit<PaymentProfileModel, 'data'> & {
          data: Omit<PaymentProfileModel['data'], 'number' | 'cvv'> & { number?: string };
        })[];
      },
    ) => Promise<void>
  > {
    const dataPayload: Rule[] = [this.validatorService.rules.required()];
    if (requestModel.paymentMethod === 'CARD_PAYMENT') {
      dataPayload.push(
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
              this.validatorService.rules.integerString(),
              this.validatorService.rules.min({ value: 1 }),
              this.validatorService.rules.max({ value: 12 }),
            ],
            expiryYear: [
              this.validatorService.rules.required(),
              this.validatorService.rules.integerString(),
              this.validatorService.rules.min({ value: 1 }),
              this.validatorService.rules.max({ value: 9999 }),
            ],
          },
        }),
      );
    }
    if (requestModel.paymentMethod === 'PHONE_PAYMENT') {
      dataPayload.push(
        this.validatorService.rules.object({
          schema: {
            countryCode: [
              this.validatorService.rules.required(),
              this.validatorService.rules.integerString(),
              this.validatorService.rules.length({ minLength: 1, maxLength: 4 }),
            ],
            areaCode: [
              this.validatorService.rules.required(),
              this.validatorService.rules.integerString(),
              this.validatorService.rules.length({ minLength: 1, maxLength: 4 }),
            ],
            number: [
              this.validatorService.rules.required(),
              this.validatorService.rules.integerString(),
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
        userId: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        paymentMethod: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.in({ values: ['CARD_PAYMENT', 'PHONE_PAYMENT'] }),
        ],
        data: dataPayload,
      },
      model: requestModel,
      data: { paymentProfiles: [] },
    });
    return (sanitizedRequestModel, validationData) => {
      const dataUnique: Rule[] = [];
      if (requestModel.paymentMethod === 'CARD_PAYMENT') {
        dataUnique.push(
          this.validatorService.rules.unique({
            dataEntity: 'paymentProfiles',
            ignoreProps: [{ modelKey: 'id', dataKey: 'id' }],
            props: [
              { modelKey: 'data.type', dataKey: 'data.type' },
              { modelKey: 'data.brand', dataKey: 'data.brand' },
              { modelKey: 'data.firstSix', dataKey: 'data.firstSix' },
              { modelKey: 'data.lastFour', dataKey: 'data.lastFour' },
              { modelKey: 'data.expiryMonth', dataKey: 'data.expiryMonth' },
              { modelKey: 'data.expiryYear', dataKey: 'data.expiryYear' },
            ],
          }),
        );
      }
      if (requestModel.paymentMethod === 'PHONE_PAYMENT') {
        dataUnique.push(
          this.validatorService.rules.unique({
            dataEntity: 'paymentProfiles',
            ignoreProps: [{ modelKey: 'id', dataKey: 'id' }],
            props: [
              { modelKey: 'data.countryCode', dataKey: 'data.countryCode' },
              { modelKey: 'data.areaCode', dataKey: 'data.areaCode' },
              { modelKey: 'data.number', dataKey: 'data.number' },
            ],
          }),
        );
      }
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
          paymentMethod: [],
          data: dataUnique,
        },
        model: sanitizedRequestModel,
        data: validationData,
      });
    };
  }
}

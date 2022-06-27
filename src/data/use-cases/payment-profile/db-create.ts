import { Hasher } from '@/data/contracts/cryptography';
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
        paymentProfiles: (Omit<PaymentProfileModel, 'data'> & {
          data: Omit<PaymentProfileModel['data'], 'number' | 'cvv'> & { number?: string };
        })[];
      }
    >,
    private readonly hasher: Hasher,
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

    const sanitizedData = await this.sanitizeData(sanitizedRequestModel);

    const paymentProfileCreated = await this.createPaymentProfileRepository.create({
      ...sanitizedRequestModel,
      data: sanitizedData,
    });

    const responseModel = { ...sanitizedRequestModel, ...paymentProfileCreated };
    Reflect.deleteProperty(responseModel.data, 'cvv');
    if (responseModel.type === 'CARD_PAYMENT') {
      Reflect.deleteProperty(responseModel.data, 'number');
    }

    return responseModel;
  }

  private sanitizeRequestModel(
    requestModel: CreatePaymentProfileUseCase.RequestModel,
  ): CreatePaymentProfileUseCase.RequestModel {
    const sanitizedRequestModel = {
      customerId: requestModel.customerId,
      type: requestModel.type,
      data: <PaymentProfileModel['data']>{},
    };

    if (typeof requestModel.data === 'object' || !Array.isArray(requestModel.data)) {
      if (requestModel.type === 'CARD_PAYMENT') {
        const cardPaymentData = requestModel.data as PaymentProfileModel<'CARD_PAYMENT'>['data'];
        sanitizedRequestModel.data = <PaymentProfileModel<'CARD_PAYMENT'>['data']>{
          type: cardPaymentData.type,
          brand: cardPaymentData.brand,
          holderName: cardPaymentData.holderName,
          number: cardPaymentData.number,
          firstSix: cardPaymentData.number.slice(0, 6),
          lastFour: cardPaymentData.number.slice(-4),
          cvv: cardPaymentData.cvv,
          expiryMonth: cardPaymentData.expiryMonth,
          expiryYear: cardPaymentData.expiryYear,
        };
      }
      if (requestModel.type === 'PHONE_PAYMENT') {
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
    requestModel: CreatePaymentProfileUseCase.RequestModel,
  ): Promise<PaymentProfileModel['data']> {
    let sanitizedData = requestModel.data as PaymentProfileModel['data'];

    if (requestModel.type === 'CARD_PAYMENT') {
      const cardPaymentData = requestModel.data as PaymentProfileModel<'CARD_PAYMENT'>['data'];
      sanitizedData = <PaymentProfileModel<'CARD_PAYMENT'>['data']>{
        ...sanitizedData,
        number: await this.hasher.hash(cardPaymentData.number),
        cvv: await this.hasher.hash(cardPaymentData.cvv),
      };
    }

    return sanitizedData;
  }

  private async validateRequestModel(
    requestModel: CreatePaymentProfileUseCase.RequestModel,
  ): Promise<
    (validationData: {
      customers: CustomerModel[];
      paymentProfiles: (Omit<PaymentProfileModel, 'data'> & {
        data: Omit<PaymentProfileModel['data'], 'number' | 'cvv'> & { number?: string };
      })[];
    }) => Promise<void>
  > {
    const dataPayload: Rule[] = [this.validatorService.rules.required()];
    if (requestModel.type === 'CARD_PAYMENT') {
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
              this.validatorService.rules.string(),
              this.validatorService.rules.length({ minLength: 16, maxLength: 16 }),
            ],
            cvv: [
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
      dataPayload.push(
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
        data: dataPayload,
      },
      model: requestModel,
      data: { customers: [], paymentProfiles: [] },
    });
    return (validationData) => {
      const dataUnique: Rule[] = [];
      if (requestModel.type === 'CARD_PAYMENT') {
        dataUnique.push(
          this.validatorService.rules.unique({
            dataEntity: 'paymentProfiles',
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
      if (requestModel.type === 'PHONE_PAYMENT') {
        dataUnique.push(
          this.validatorService.rules.unique({
            dataEntity: 'paymentProfiles',
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
          customerId: [
            this.validatorService.rules.exists({
              dataEntity: 'customers',
              props: [{ modelKey: 'customerId', dataKey: 'id' }],
            }),
          ],
          type: [],
          data: dataUnique,
        },
        model: requestModel,
        data: validationData,
      });
    };
  }
}

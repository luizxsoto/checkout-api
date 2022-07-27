import { Hasher } from '@/data/contracts/cryptography';
import {
  CreatePaymentProfileRepository,
  FindByPaymentProfileRepository,
  FindByUserRepository,
} from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { PaymentProfileModel, UserModel } from '@/domain/models';
import { CreatePaymentProfileUseCase } from '@/domain/use-cases';

export class DbCreatePaymentProfileUseCase implements CreatePaymentProfileUseCase.UseCase {
  constructor(
    private readonly createPaymentProfileRepository: CreatePaymentProfileRepository.Repository,
    private readonly findByPaymentProfileRepository: FindByPaymentProfileRepository.Repository,
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      CreatePaymentProfileUseCase.RequestModel,
      {
        users: Omit<UserModel, 'password'>[];
        paymentProfiles: Omit<PaymentProfileModel, 'number' | 'cvv'>[];
      }
    >,
    private readonly hasher: Hasher,
  ) {}

  public async execute(
    requestModel: CreatePaymentProfileUseCase.RequestModel,
  ): Promise<CreatePaymentProfileUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const users = await this.findByUserRepository.findBy([{ id: sanitizedRequestModel.userId }]);

    const paymentProfiles = await this.findByPaymentProfileRepository.findBy([
      { userId: sanitizedRequestModel.userId },
    ]);

    const requestModelWithSanitizedData = await this.sanitizeData(sanitizedRequestModel);

    await restValidation(requestModelWithSanitizedData, { users, paymentProfiles });

    const paymentProfileCreated = await this.createPaymentProfileRepository.create(
      requestModelWithSanitizedData,
    );

    const responseModel = { ...requestModelWithSanitizedData, ...paymentProfileCreated };
    Reflect.deleteProperty(responseModel, 'cvv');
    Reflect.deleteProperty(responseModel, 'number');

    return responseModel;
  }

  private sanitizeRequestModel(
    requestModel: CreatePaymentProfileUseCase.RequestModel,
  ): CreatePaymentProfileUseCase.RequestModel {
    const sanitizedRequestModel = {
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
    requestModel: CreatePaymentProfileUseCase.RequestModel,
  ): Promise<Omit<PaymentProfileModel, 'id' | 'createUserId' | 'createdAt'>> {
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
    requestModel: CreatePaymentProfileUseCase.RequestModel,
  ): Promise<
    (
      sanitizedRequestModel: Omit<PaymentProfileModel, 'id' | 'createUserId' | 'createdAt'>,
      validationData: {
        users: Omit<UserModel, 'password'>[];
        paymentProfiles: Omit<PaymentProfileModel, 'number' | 'cvv'>[];
      },
    ) => Promise<void>
  > {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    await this.validatorService.validate({
      schema: {
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
      data: { users: [], paymentProfiles: [] },
    });
    return (sanitizedRequestModel, validationData) => {
      const uniqueValidation = [
        this.validatorService.rules.unique({
          dataEntity: 'paymentProfiles',
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
          userId: [
            this.validatorService.rules.exists({
              dataEntity: 'users',
              props: [{ modelKey: 'userId', dataKey: 'id' }],
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

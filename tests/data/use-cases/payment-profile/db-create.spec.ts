import { DbCreatePaymentProfileUseCase } from '@/data/use-cases';
import { CreatePaymentProfileUseCase } from '@/domain/use-cases';
import { ValidationException } from '@/main/exceptions';
import { makeHasherCryptographyStub } from '@tests/data/stubs/cryptography';
import {
  makePaymentProfileRepositoryStub,
  makeUserRepositoryStub,
} from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';
import { makeUserModelMock } from '@tests/domain/mocks/models';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';
const nonExistentId = '00000000-0000-4000-8000-000000000002';
const str1Length = '';
const str3Length = '123';
const str20Length = '12345678901234567890';
const str25Length = '1234567890123456789012345';
const str16Length = '1234567890123456';
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;

function makeSut() {
  const paymentProfileRepository = makePaymentProfileRepositoryStub();
  const userRepository = makeUserRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const hasherCryptography = makeHasherCryptographyStub();
  const sut = new DbCreatePaymentProfileUseCase(
    paymentProfileRepository,
    paymentProfileRepository,
    userRepository,
    validatorService,
    hasherCryptography,
  );

  return {
    paymentProfileRepository,
    userRepository,
    validatorService,
    hasherCryptography,
    sut,
  };
}

describe(DbCreatePaymentProfileUseCase.name, () => {
  test('Should create paymentProfile and return correct values', async () => {
    const { paymentProfileRepository, userRepository, validatorService, hasherCryptography, sut } =
      makeSut();

    const requestModel = {
      userId: validUuidV4,
      type: 'CREDIT' as const,
      brand: 'any_brand',
      holderName: 'any_holderName',
      number: '1234567890123456',
      cvv: '123',
      expiryMonth: 12,
      expiryYear: 9999,
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = {
      ...requestModel,
    };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const requestModelWithSanitizedData = {
      ...sanitizedRequestModel,
      number: 'hashed_number',
      firstSix: '123456',
      lastFour: '3456',
      cvv: 'hashed_cvv',
    };
    const responseModel = {
      ...requestModelWithSanitizedData,
      id: 'any_id',
      createdAt: new Date(),
    };
    Reflect.deleteProperty(responseModel, 'cvv');
    Reflect.deleteProperty(responseModel, 'number');
    const user = makeUserModelMock();
    const otherPaymentProfile = {
      ...responseModel,
      type: 'DEBIT',
    };

    userRepository.findBy.mockReturnValueOnce([user]);
    paymentProfileRepository.findBy.mockReturnValueOnce([otherPaymentProfile]);
    hasherCryptography.hash.mockReturnValueOnce(Promise.resolve('hashed_number'));
    hasherCryptography.hash.mockReturnValueOnce(Promise.resolve('hashed_cvv'));
    paymentProfileRepository.create.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        userId: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        type: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.in({ values: ['CREDIT', 'DEBIT'] }),
        ],
        brand: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.length({ minLength: 1, maxLength: 20 }),
        ],
        holderName: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.length({ minLength: 1, maxLength: 25 }),
        ],
        number: [
          validatorService.rules.required(),
          validatorService.rules.integerString(),
          validatorService.rules.length({ minLength: 16, maxLength: 16 }),
        ],
        cvv: [
          validatorService.rules.required(),
          validatorService.rules.integerString(),
          validatorService.rules.length({ minLength: 3, maxLength: 3 }),
        ],
        expiryMonth: [
          validatorService.rules.required(),
          validatorService.rules.integer(),
          validatorService.rules.min({
            value: sanitizedRequestModel.expiryYear <= currentYear ? currentMonth : 1,
          }),
          validatorService.rules.max({ value: 12 }),
        ],
        expiryYear: [
          validatorService.rules.required(),
          validatorService.rules.integer(),
          validatorService.rules.min({ value: currentYear }),
          validatorService.rules.max({ value: 9999 }),
        ],
      },
      model: sanitizedRequestModel,
      data: { users: [], paymentProfiles: [] },
    });
    expect(userRepository.findBy).toBeCalledWith([{ id: sanitizedRequestModel.userId }]);
    expect(paymentProfileRepository.findBy).toBeCalledWith([
      { userId: sanitizedRequestModel.userId },
    ]);
    expect(hasherCryptography.hash).toBeCalledWith(sanitizedRequestModel.number);
    expect(hasherCryptography.hash).toBeCalledWith(sanitizedRequestModel.cvv);
    const uniqueValidation = [
      validatorService.rules.unique({
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
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        userId: [
          validatorService.rules.exists({
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
      model: requestModelWithSanitizedData,
      data: { users: [user], paymentProfiles: [otherPaymentProfile] },
    });
    expect(paymentProfileRepository.create).toBeCalledWith(requestModelWithSanitizedData);
  });

  describe.each([
    // userId
    {
      properties: { userId: undefined },
      validations: [{ field: 'userId', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { userId: 1 },
      validations: [{ field: 'userId', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { userId: 'invalid_id' },
      validations: [
        {
          field: 'userId',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
        },
      ],
    },
    {
      properties: {
        userId: nonExistentId,
        number: '1234567890123457',
      },
      validations: [{ field: 'userId', rule: 'exists', message: 'This value was not found' }],
    },
    // type
    {
      properties: { type: undefined },
      validations: [{ field: 'type', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { type: 1 },
      validations: [{ field: 'type', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { type: 'invalid_type' },
      validations: [
        {
          field: 'type',
          rule: 'in',
          message: 'This value must be in: CREDIT, DEBIT',
        },
      ],
    },
    // brand
    {
      properties: { brand: undefined },
      validations: [{ field: 'brand', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { brand: 1 },
      validations: [{ field: 'brand', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { brand: str1Length.slice(0, -1) },
      validations: [
        {
          field: 'brand',
          rule: 'length',
          message: 'This value length must be beetween 1 and 20',
        },
      ],
    },
    {
      properties: { brand: `${str20Length}1` },
      validations: [
        {
          field: 'brand',
          rule: 'length',
          message: 'This value length must be beetween 1 and 20',
        },
      ],
    },
    // holderName
    {
      properties: { holderName: undefined },
      validations: [{ field: 'holderName', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { holderName: 1 },
      validations: [
        { field: 'holderName', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { holderName: str1Length.slice(0, -1) },
      validations: [
        {
          field: 'holderName',
          rule: 'length',
          message: 'This value length must be beetween 1 and 25',
        },
      ],
    },
    {
      properties: { holderName: `${str25Length}6` },
      validations: [
        {
          field: 'holderName',
          rule: 'length',
          message: 'This value length must be beetween 1 and 25',
        },
      ],
    },
    // number
    {
      properties: { number: undefined },
      validations: [{ field: 'number', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { number: 1 },
      validations: [
        {
          field: 'number',
          rule: 'integerString',
          message: 'This value must be an integer in a string',
        },
      ],
    },
    {
      properties: { number: str16Length.slice(0, -1) },
      validations: [
        {
          field: 'number',
          rule: 'length',
          message: 'This value length must be beetween 16 and 16',
        },
      ],
    },
    {
      properties: { number: `${str16Length}7` },
      validations: [
        {
          field: 'number',
          rule: 'length',
          message: 'This value length must be beetween 16 and 16',
        },
      ],
    },
    // cvv
    {
      properties: { cvv: undefined },
      validations: [{ field: 'cvv', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { cvv: 1 },
      validations: [
        {
          field: 'cvv',
          rule: 'integerString',
          message: 'This value must be an integer in a string',
        },
      ],
    },
    {
      properties: { cvv: str3Length.slice(0, -1) },
      validations: [
        {
          field: 'cvv',
          rule: 'length',
          message: 'This value length must be beetween 3 and 3',
        },
      ],
    },
    {
      properties: { cvv: `${str3Length}4` },
      validations: [
        {
          field: 'cvv',
          rule: 'length',
          message: 'This value length must be beetween 3 and 3',
        },
      ],
    },
    // expiryMonth
    {
      properties: { expiryMonth: undefined },
      validations: [{ field: 'expiryMonth', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { expiryMonth: 1.2 },
      validations: [
        {
          field: 'expiryMonth',
          rule: 'integer',
          message: 'This value must be an integer',
        },
      ],
    },
    {
      properties: { expiryMonth: 0, expiryYear: currentYear },
      validations: [
        {
          field: 'expiryMonth',
          rule: 'min',
          message: `This value must be bigger or equal to: ${currentMonth}`,
        },
      ],
    },
    {
      properties: { expiryMonth: 13 },
      validations: [
        {
          field: 'expiryMonth',
          rule: 'max',
          message: 'This value must be less or equal to: 12',
        },
      ],
    },
    // expiryYear
    {
      properties: { expiryYear: undefined },
      validations: [{ field: 'expiryYear', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { expiryYear: 1.2 },
      validations: [
        {
          field: 'expiryYear',
          rule: 'integer',
          message: 'This value must be an integer',
        },
      ],
    },
    {
      properties: { expiryYear: currentYear - 1 },
      validations: [
        {
          field: 'expiryYear',
          rule: 'min',
          message: `This value must be bigger or equal to: ${currentYear}`,
        },
      ],
    },
    {
      properties: { expiryYear: 10000 },
      validations: [
        {
          field: 'expiryYear',
          rule: 'max',
          message: 'This value must be less or equal to: 9999',
        },
      ],
    },
  ])(
    'Should throw ValidationException for every user invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut();

        const requestModel = {
          userId: validUuidV4,
          type: 'CREDIT' as const,
          brand: 'any_brand',
          holderName: 'any_holderName',
          number: '1234567890123456',
          cvv: '123',
          expiryMonth: 12,
          expiryYear: 9999,
          ...properties,
        } as CreatePaymentProfileUseCase.RequestModel;

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

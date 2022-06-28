import { DbCreatePaymentProfileUseCase } from '@/data/use-cases';
import { PaymentProfileModel } from '@/domain/models';
import { CreatePaymentProfileUseCase } from '@/domain/use-cases';
import { ValidationException } from '@/main/exceptions';
import { makeHasherCryptographyStub } from '@tests/data/stubs/cryptography';
import {
  makeCustomerRepositoryStub,
  makePaymentProfileRepositoryStub,
} from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';
import { makeCustomerModelMock, makePaymentProfileModelMock } from '@tests/domain/mocks/models';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';
const nonExistentId = '00000000-0000-4000-8000-000000000002';
const str1Length = '';
const str3Length = '123';
const str4Length = '1234';
const str10Length = '1234567890';
const str15Length = '123456789012345';
const str16Length = '1234567890123456';

function makeSut() {
  const paymentProfileRepository = makePaymentProfileRepositoryStub();
  const customerRepository = makeCustomerRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const hasherCryptography = makeHasherCryptographyStub();
  const sut = new DbCreatePaymentProfileUseCase(
    paymentProfileRepository,
    paymentProfileRepository,
    customerRepository,
    validatorService,
    hasherCryptography,
  );

  return {
    paymentProfileRepository,
    customerRepository,
    validatorService,
    hasherCryptography,
    sut,
  };
}

describe(DbCreatePaymentProfileUseCase.name, () => {
  test('Should create paymentProfile and return correct values for CARD_PAYMENT', async () => {
    const {
      paymentProfileRepository,
      customerRepository,
      validatorService,
      hasherCryptography,
      sut,
    } = makeSut();

    const requestModel = {
      customerId: validUuidV4,
      type: 'CARD_PAYMENT' as PaymentProfileModel['type'],
      anyWrongProp: 'anyValue',
      data: {
        type: 'CREDIT',
        brand: 'any_brand',
        holderName: 'any_holderName',
        number: '1234567890123456',
        cvv: '123',
        expiryMonth: '01',
        expiryYear: '0001',
        anyWrongProp: 'anyValue',
      },
    };
    const sanitizedRequestModel = {
      ...requestModel,
      data: { ...requestModel.data },
    };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    Reflect.deleteProperty(sanitizedRequestModel.data, 'anyWrongProp');
    const requestModelWithSanitizedData = {
      ...sanitizedRequestModel,
      data: {
        ...sanitizedRequestModel.data,
        number: 'hashed_number',
        firstSix: '123456',
        lastFour: '3456',
        cvv: 'hashed_cvv',
      },
    };
    const responseModel = {
      ...sanitizedRequestModel,
      data: { ...sanitizedRequestModel.data },
      id: 'any_id',
      createdAt: new Date(),
    };
    const customer = makeCustomerModelMock();
    const otherPaymentProfile = {
      ...responseModel,
      data: { ...responseModel.data, type: 'DEBIT' },
    };

    customerRepository.findBy.mockReturnValueOnce([customer]);
    paymentProfileRepository.findBy.mockReturnValueOnce([otherPaymentProfile]);
    hasherCryptography.hash.mockReturnValueOnce(Promise.resolve('hashed_number'));
    hasherCryptography.hash.mockReturnValueOnce(Promise.resolve('hashed_cvv'));
    paymentProfileRepository.create.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        customerId: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        type: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.in({ values: ['CARD_PAYMENT', 'PHONE_PAYMENT'] }),
        ],
        data: [
          validatorService.rules.required(),
          validatorService.rules.object({
            schema: {
              type: [
                validatorService.rules.required(),
                validatorService.rules.string(),
                validatorService.rules.in({ values: ['CREDIT', 'DEBIT'] }),
              ],
              brand: [
                validatorService.rules.required(),
                validatorService.rules.string(),
                validatorService.rules.length({ minLength: 1, maxLength: 15 }),
              ],
              holderName: [
                validatorService.rules.required(),
                validatorService.rules.string(),
                validatorService.rules.length({ minLength: 1, maxLength: 15 }),
              ],
              number: [
                validatorService.rules.required(),
                validatorService.rules.numberString(),
                validatorService.rules.length({ minLength: 16, maxLength: 16 }),
              ],
              cvv: [
                validatorService.rules.required(),
                validatorService.rules.numberString(),
                validatorService.rules.length({ minLength: 3, maxLength: 3 }),
              ],
              expiryMonth: [
                validatorService.rules.required(),
                validatorService.rules.numberString(),
                validatorService.rules.min({ value: 1 }),
                validatorService.rules.max({ value: 12 }),
              ],
              expiryYear: [
                validatorService.rules.required(),
                validatorService.rules.numberString(),
                validatorService.rules.min({ value: 1 }),
                validatorService.rules.max({ value: 9999 }),
              ],
            },
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: { customers: [], paymentProfiles: [] },
    });
    expect(customerRepository.findBy).toBeCalledWith([{ id: sanitizedRequestModel.customerId }]);
    expect(paymentProfileRepository.findBy).toBeCalledWith([
      { customerId: sanitizedRequestModel.customerId },
    ]);
    expect(hasherCryptography.hash).toBeCalledWith(sanitizedRequestModel.data.number);
    expect(hasherCryptography.hash).toBeCalledWith(sanitizedRequestModel.data.cvv);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        customerId: [
          validatorService.rules.exists({
            dataEntity: 'customers',
            props: [{ modelKey: 'customerId', dataKey: 'id' }],
          }),
        ],
        type: [],
        data: [
          validatorService.rules.unique({
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
        ],
      },
      model: requestModelWithSanitizedData,
      data: { customers: [customer], paymentProfiles: [otherPaymentProfile] },
    });
    expect(paymentProfileRepository.create).toBeCalledWith(requestModelWithSanitizedData);
  });

  test('Should create paymentProfile and return correct values for PHONE_PAYMENT', async () => {
    const {
      paymentProfileRepository,
      customerRepository,
      validatorService,
      hasherCryptography,
      sut,
    } = makeSut();

    const requestModel = {
      customerId: validUuidV4,
      type: 'PHONE_PAYMENT' as PaymentProfileModel['type'],
      anyWrongProp: 'anyValue',
      data: {
        countryCode: '1234',
        areaCode: '1234',
        number: '1234567890',
        anyWrongProp: 'anyValue',
      },
    };
    const sanitizedRequestModel = {
      ...requestModel,
      data: { ...requestModel.data },
    };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    Reflect.deleteProperty(sanitizedRequestModel.data, 'anyWrongProp');
    const requestModelWithSanitizedData = {
      ...sanitizedRequestModel,
      data: {
        ...sanitizedRequestModel.data,
      },
    };
    const responseModel = {
      ...sanitizedRequestModel,
      data: { ...sanitizedRequestModel.data },
      id: 'any_id',
      createdAt: new Date(),
    };
    const customer = makeCustomerModelMock();
    const otherPaymentProfile = {
      ...responseModel,
      data: { ...responseModel.data, number: '1234567891' },
    };

    customerRepository.findBy.mockReturnValueOnce([customer]);
    paymentProfileRepository.findBy.mockReturnValueOnce([otherPaymentProfile]);
    paymentProfileRepository.create.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        customerId: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        type: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.in({ values: ['CARD_PAYMENT', 'PHONE_PAYMENT'] }),
        ],
        data: [
          validatorService.rules.required(),
          validatorService.rules.object({
            schema: {
              countryCode: [
                validatorService.rules.required(),
                validatorService.rules.numberString(),
                validatorService.rules.length({ minLength: 1, maxLength: 4 }),
              ],
              areaCode: [
                validatorService.rules.required(),
                validatorService.rules.numberString(),
                validatorService.rules.length({ minLength: 1, maxLength: 4 }),
              ],
              number: [
                validatorService.rules.required(),
                validatorService.rules.numberString(),
                validatorService.rules.length({ minLength: 1, maxLength: 10 }),
              ],
            },
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: { customers: [], paymentProfiles: [] },
    });
    expect(customerRepository.findBy).toBeCalledWith([{ id: sanitizedRequestModel.customerId }]);
    expect(paymentProfileRepository.findBy).toBeCalledWith([
      { customerId: sanitizedRequestModel.customerId },
    ]);
    expect(hasherCryptography.hash).not.toBeCalled();
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        customerId: [
          validatorService.rules.exists({
            dataEntity: 'customers',
            props: [{ modelKey: 'customerId', dataKey: 'id' }],
          }),
        ],
        type: [],
        data: [
          validatorService.rules.unique({
            dataEntity: 'paymentProfiles',
            props: [
              { modelKey: 'data.countryCode', dataKey: 'data.countryCode' },
              { modelKey: 'data.areaCode', dataKey: 'data.areaCode' },
              { modelKey: 'data.number', dataKey: 'data.number' },
            ],
          }),
        ],
      },
      model: requestModelWithSanitizedData,
      data: { customers: [customer], paymentProfiles: [otherPaymentProfile] },
    });
    expect(paymentProfileRepository.create).toBeCalledWith(requestModelWithSanitizedData);
  });

  describe.each([
    // customerId
    {
      properties: { customerId: undefined },
      validations: [{ field: 'customerId', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { customerId: 1 },
      validations: [
        { field: 'customerId', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { customerId: 'invalid_id' },
      validations: [
        {
          field: 'customerId',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
        },
      ],
    },
    {
      properties: {
        customerId: nonExistentId,
        data: { ...makePaymentProfileModelMock().data, number: '1234567890123457' },
      },
      validations: [{ field: 'customerId', rule: 'exists', message: 'This value was not found' }],
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
          message: 'This value must be in: CARD_PAYMENT, PHONE_PAYMENT',
        },
      ],
    },
    // data
    {
      properties: { data: undefined },
      validations: [{ field: 'data', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { data: 'invalid_object' },
      validations: [{ field: 'data', rule: 'object', message: 'This value must be an object' }],
    },
    // CARD_PAYMENT
    // data
    {
      properties: { type: 'CARD_PAYMENT' },
      validations: [
        {
          field: 'data',
          rule: 'unique',
          message: 'This value has already been used',
        },
      ],
    },
    // data.type
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, type: undefined },
      },
      validations: [{ field: 'data.type', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, type: 1 },
      },
      validations: [{ field: 'data.type', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, type: 'invalid_type' },
      },
      validations: [
        {
          field: 'data.type',
          rule: 'in',
          message: 'This value must be in: CREDIT, DEBIT',
        },
      ],
    },
    // data.brand
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, brand: undefined },
      },
      validations: [{ field: 'data.brand', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, brand: 1 },
      },
      validations: [
        { field: 'data.brand', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, brand: str1Length.slice(0, -1) },
      },
      validations: [
        {
          field: 'data.brand',
          rule: 'length',
          message: 'This value length must be beetween 1 and 15',
        },
      ],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, brand: `${str15Length}6` },
      },
      validations: [
        {
          field: 'data.brand',
          rule: 'length',
          message: 'This value length must be beetween 1 and 15',
        },
      ],
    },
    // data.holderName
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, holderName: undefined },
      },
      validations: [
        { field: 'data.holderName', rule: 'required', message: 'This value is required' },
      ],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, holderName: 1 },
      },
      validations: [
        { field: 'data.holderName', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, holderName: str1Length.slice(0, -1) },
      },
      validations: [
        {
          field: 'data.holderName',
          rule: 'length',
          message: 'This value length must be beetween 1 and 15',
        },
      ],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, holderName: `${str15Length}6` },
      },
      validations: [
        {
          field: 'data.holderName',
          rule: 'length',
          message: 'This value length must be beetween 1 and 15',
        },
      ],
    },
    // data.number
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, number: undefined },
      },
      validations: [{ field: 'data.number', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, number: 1 },
      },
      validations: [
        {
          field: 'data.number',
          rule: 'numberString',
          message: 'This value must be a number in a string',
        },
      ],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, number: str16Length.slice(0, -1) },
      },
      validations: [
        {
          field: 'data.number',
          rule: 'length',
          message: 'This value length must be beetween 16 and 16',
        },
      ],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, number: `${str16Length}7` },
      },
      validations: [
        {
          field: 'data.number',
          rule: 'length',
          message: 'This value length must be beetween 16 and 16',
        },
      ],
    },
    // data.cvv
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, cvv: undefined },
      },
      validations: [{ field: 'data.cvv', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, cvv: 1 },
      },
      validations: [
        {
          field: 'data.cvv',
          rule: 'numberString',
          message: 'This value must be a number in a string',
        },
      ],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, cvv: str3Length.slice(0, -1) },
      },
      validations: [
        {
          field: 'data.cvv',
          rule: 'length',
          message: 'This value length must be beetween 3 and 3',
        },
      ],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, cvv: `${str3Length}4` },
      },
      validations: [
        {
          field: 'data.cvv',
          rule: 'length',
          message: 'This value length must be beetween 3 and 3',
        },
      ],
    },
    // data.expiryMonth
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, expiryMonth: undefined },
      },
      validations: [
        { field: 'data.expiryMonth', rule: 'required', message: 'This value is required' },
      ],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, expiryMonth: 1 },
      },
      validations: [
        {
          field: 'data.expiryMonth',
          rule: 'numberString',
          message: 'This value must be a number in a string',
        },
      ],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, expiryMonth: '0' },
      },
      validations: [
        { field: 'data.expiryMonth', rule: 'min', message: 'This value must be bigger than: 1' },
      ],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, expiryMonth: '13' },
      },
      validations: [
        {
          field: 'data.expiryMonth',
          rule: 'max',
          message: 'This value must be smaller than: 12',
        },
      ],
    },
    // data.expiryYear
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, expiryYear: undefined },
      },
      validations: [
        { field: 'data.expiryYear', rule: 'required', message: 'This value is required' },
      ],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, expiryYear: 1 },
      },
      validations: [
        {
          field: 'data.expiryYear',
          rule: 'numberString',
          message: 'This value must be a number in a string',
        },
      ],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, expiryYear: '0' },
      },
      validations: [
        { field: 'data.expiryYear', rule: 'min', message: 'This value must be bigger than: 1' },
      ],
    },
    {
      properties: {
        type: 'CARD_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, expiryYear: '10000' },
      },
      validations: [
        {
          field: 'data.expiryYear',
          rule: 'max',
          message: 'This value must be smaller than: 9999',
        },
      ],
    },
    // PHONE_PAYMENT
    // data
    {
      properties: {
        type: 'PHONE_PAYMENT',
        data: {
          ...makePaymentProfileModelMock().data,
          number: '1234567890',
        },
      },
      validations: [
        {
          field: 'data',
          rule: 'unique',
          message: 'This value has already been used',
        },
      ],
    },
    // data.countryCode
    {
      properties: {
        type: 'PHONE_PAYMENT',
        data: {
          ...makePaymentProfileModelMock().data,
          number: '1234567890',
          countryCode: undefined,
        },
      },
      validations: [
        { field: 'data.countryCode', rule: 'required', message: 'This value is required' },
      ],
    },
    {
      properties: {
        type: 'PHONE_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, number: '1234567890', countryCode: 1 },
      },
      validations: [
        {
          field: 'data.countryCode',
          rule: 'numberString',
          message: 'This value must be a number in a string',
        },
      ],
    },
    {
      properties: {
        type: 'PHONE_PAYMENT',
        data: {
          ...makePaymentProfileModelMock().data,
          number: '1234567890',
          countryCode: str1Length.slice(0, -1),
        },
      },
      validations: [
        {
          field: 'data.countryCode',
          rule: 'length',
          message: 'This value length must be beetween 1 and 4',
        },
      ],
    },
    {
      properties: {
        type: 'PHONE_PAYMENT',
        data: {
          ...makePaymentProfileModelMock().data,
          number: '1234567890',
          countryCode: `${str4Length}5`,
        },
      },
      validations: [
        {
          field: 'data.countryCode',
          rule: 'length',
          message: 'This value length must be beetween 1 and 4',
        },
      ],
    },
    // data.areaCode
    {
      properties: {
        type: 'PHONE_PAYMENT',
        data: {
          ...makePaymentProfileModelMock().data,
          number: '1234567890',
          areaCode: undefined,
        },
      },
      validations: [
        { field: 'data.areaCode', rule: 'required', message: 'This value is required' },
      ],
    },
    {
      properties: {
        type: 'PHONE_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, number: '1234567890', areaCode: 1 },
      },
      validations: [
        {
          field: 'data.areaCode',
          rule: 'numberString',
          message: 'This value must be a number in a string',
        },
      ],
    },
    {
      properties: {
        type: 'PHONE_PAYMENT',
        data: {
          ...makePaymentProfileModelMock().data,
          number: '1234567890',
          areaCode: str1Length.slice(0, -1),
        },
      },
      validations: [
        {
          field: 'data.areaCode',
          rule: 'length',
          message: 'This value length must be beetween 1 and 4',
        },
      ],
    },
    {
      properties: {
        type: 'PHONE_PAYMENT',
        data: {
          ...makePaymentProfileModelMock().data,
          number: '1234567890',
          areaCode: `${str4Length}5`,
        },
      },
      validations: [
        {
          field: 'data.areaCode',
          rule: 'length',
          message: 'This value length must be beetween 1 and 4',
        },
      ],
    },
    // data.number
    {
      properties: {
        type: 'PHONE_PAYMENT',
        data: {
          ...makePaymentProfileModelMock().data,
          number: undefined,
        },
      },
      validations: [{ field: 'data.number', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: {
        type: 'PHONE_PAYMENT',
        data: { ...makePaymentProfileModelMock().data, number: 1 },
      },
      validations: [
        {
          field: 'data.number',
          rule: 'numberString',
          message: 'This value must be a number in a string',
        },
      ],
    },
    {
      properties: {
        type: 'PHONE_PAYMENT',
        data: {
          ...makePaymentProfileModelMock().data,
          number: str1Length.slice(0, -1),
        },
      },
      validations: [
        {
          field: 'data.number',
          rule: 'length',
          message: 'This value length must be beetween 1 and 10',
        },
      ],
    },
    {
      properties: {
        type: 'PHONE_PAYMENT',
        data: {
          ...makePaymentProfileModelMock().data,
          number: `${str10Length}1`,
        },
      },
      validations: [
        {
          field: 'data.number',
          rule: 'length',
          message: 'This value length must be beetween 1 and 10',
        },
      ],
    },
  ])(
    'Should throw ValidationException for every customer invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut();

        const requestModel = {
          customerId: validUuidV4,
          type: 'CARD_PAYMENT',
          data: {
            type: 'CREDIT',
            brand: 'any_brand',
            holderName: 'any_holderName',
            number: '1234567890123456',
            firstSix: '123456',
            lastFour: '3456',
            cvv: '123',
            expiryYear: '1234',
            expiryMonth: '12',
            areaCode: '1234',
            countryCode: '1234',
          },
          ...properties,
        } as CreatePaymentProfileUseCase.RequestModel;

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

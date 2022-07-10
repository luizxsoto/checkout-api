import { DbShowPaymentProfileUseCase } from '@/data/use-cases';
import { ShowPaymentProfileUseCase } from '@/domain/use-cases';
import { ValidationException } from '@/main/exceptions';
import { makePaymentProfileRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';
const nonExistentId = '00000000-0000-4000-8000-000000000002';

function makeSut() {
  const paymentProfileRepository = makePaymentProfileRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbShowPaymentProfileUseCase(paymentProfileRepository, validatorService);

  return { paymentProfileRepository, validatorService, sut };
}

describe(DbShowPaymentProfileUseCase.name, () => {
  test('Should show paymentProfile and return correct values for CARD_PAYMENT', async () => {
    const { paymentProfileRepository, validatorService, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = { ...requestModel };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = {
      ...sanitizedRequestModel,
      customerId: validUuidV4,
      paymentMethod: 'CARD_PAYMENT',
      data: {
        type: 'CREDIT',
        brand: 'any_brand',
        holderName: 'any_holderName',
        number: 'hashed_number',
        cvv: 'hashed_cvv',
        expiryMonth: '01',
        expiryYear: '0001',
      },
    };
    const existsPaymentProfile = { ...responseModel };

    paymentProfileRepository.findBy.mockReturnValueOnce([existsPaymentProfile]);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        id: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
      },
      model: sanitizedRequestModel,
      data: { paymentProfiles: [] },
    });
    expect(paymentProfileRepository.findBy).toBeCalledWith([sanitizedRequestModel], true);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        id: [
          validatorService.rules.exists({
            dataEntity: 'paymentProfiles',
            props: [{ modelKey: 'id', dataKey: 'id' }],
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: { paymentProfiles: [existsPaymentProfile] },
    });
  });

  test('Should show paymentProfile and return correct values for PHONE_PAYMENT', async () => {
    const { paymentProfileRepository, validatorService, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = { ...requestModel };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = {
      ...sanitizedRequestModel,
      customerId: validUuidV4,
      paymentMethod: 'PHONE_PAYMENT',
      data: {
        countryCode: 'any_countryCode',
        areaCode: 'any_areaCode',
        number: 'any_number',
      },
    };
    const existsPaymentProfile = { ...responseModel };

    paymentProfileRepository.findBy.mockReturnValueOnce([existsPaymentProfile]);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        id: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
      },
      model: sanitizedRequestModel,
      data: { paymentProfiles: [] },
    });
    expect(paymentProfileRepository.findBy).toBeCalledWith([sanitizedRequestModel], true);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        id: [
          validatorService.rules.exists({
            dataEntity: 'paymentProfiles',
            props: [{ modelKey: 'id', dataKey: 'id' }],
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: { paymentProfiles: [existsPaymentProfile] },
    });
  });

  describe.each([
    // id
    {
      properties: { id: undefined },
      validations: [{ field: 'id', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { id: 1 },
      validations: [{ field: 'id', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { id: 'invalid_uuid' },
      validations: [
        {
          field: 'id',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
        },
      ],
    },
    {
      properties: { id: nonExistentId },
      validations: [{ field: 'id', rule: 'exists', message: 'This value was not found' }],
    },
  ])(
    'Should throw ValidationException for every paymentProfile invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut();

        const requestModel = { ...properties } as ShowPaymentProfileUseCase.RequestModel;

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

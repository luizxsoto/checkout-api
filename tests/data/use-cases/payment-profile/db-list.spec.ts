import { MAX_PER_PAGE, MIN_PER_PAGE } from '@/data/constants';
import { DbListPaymentProfileUseCase } from '@/data/use-cases';
import { PaymentProfileModel } from '@/domain/models';
import { ListPaymentProfileUseCase } from '@/domain/use-cases';
import { ValidationException } from '@/main/exceptions';
import { makePaymentProfileRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

function makeSut() {
  const paymentProfileRepository = makePaymentProfileRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbListPaymentProfileUseCase(paymentProfileRepository, validatorService);

  return { paymentProfileRepository, validatorService, sut };
}

describe(DbListPaymentProfileUseCase.name, () => {
  test('Should list paymentProfile and return correct values', async () => {
    const { paymentProfileRepository, validatorService, sut } = makeSut();

    const requestModel = {
      page: 1,
      perPage: 20,
      orderBy: 'paymentMethod' as const,
      order: 'asc' as const,
      filters: '[]',
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = { ...requestModel };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = { ...sanitizedRequestModel };
    Reflect.deleteProperty(responseModel, 'page');
    Reflect.deleteProperty(responseModel, 'perPage');
    Reflect.deleteProperty(responseModel, 'orderBy');
    Reflect.deleteProperty(responseModel, 'order');
    Reflect.deleteProperty(responseModel, 'filters');
    const existsPaymentProfile = { ...responseModel };

    paymentProfileRepository.list.mockReturnValueOnce([existsPaymentProfile]);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual([responseModel]);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        page: [validatorService.rules.integer(), validatorService.rules.min({ value: 1 })],
        perPage: [
          validatorService.rules.integer(),
          validatorService.rules.min({ value: 20 }),
          validatorService.rules.max({ value: 50 }),
        ],
        orderBy: [
          validatorService.rules.string(),
          validatorService.rules.in({
            values: ['customerId', 'paymentMethod', 'createdAt', 'updatedAt'],
          }),
        ],
        order: [
          validatorService.rules.string(),
          validatorService.rules.in({ values: ['asc', 'desc'] }),
        ],
        filters: [
          validatorService.rules.listFilters<
            Omit<PaymentProfileModel, 'id' | 'data' | 'deleteUserId' | 'deletedAt'>
          >({
            schema: {
              customerId: [
                validatorService.rules.array({
                  rules: [
                    validatorService.rules.string(),
                    validatorService.rules.regex({ pattern: 'uuidV4' }),
                  ],
                }),
              ],
              paymentMethod: [
                validatorService.rules.array({
                  rules: [
                    validatorService.rules.string(),
                    validatorService.rules.in({ values: ['CARD_PAYMENT', 'PHONE_PAYMENT'] }),
                  ],
                }),
              ],
              createUserId: [
                validatorService.rules.array({
                  rules: [
                    validatorService.rules.string(),
                    validatorService.rules.regex({ pattern: 'uuidV4' }),
                  ],
                }),
              ],
              updateUserId: [
                validatorService.rules.array({
                  rules: [
                    validatorService.rules.string(),
                    validatorService.rules.regex({ pattern: 'uuidV4' }),
                  ],
                }),
              ],
              createdAt: [
                validatorService.rules.array({
                  rules: [validatorService.rules.string(), validatorService.rules.date()],
                }),
              ],
              updatedAt: [
                validatorService.rules.array({
                  rules: [validatorService.rules.string(), validatorService.rules.date()],
                }),
              ],
            },
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: {},
    });
    expect(paymentProfileRepository.list).toBeCalledWith(sanitizedRequestModel);
  });

  describe.each([
    // page
    {
      properties: { page: 'page' },
      validations: [{ field: 'page', rule: 'number', message: 'This value must be a number' }],
    },
    {
      properties: { page: 0 },
      validations: [
        { field: 'page', rule: 'min', message: 'This value must be bigger or equal to: 1' },
      ],
    },
    // perPage
    {
      properties: { perPage: 'perPage' },
      validations: [{ field: 'perPage', rule: 'number', message: 'This value must be a number' }],
    },
    {
      properties: { perPage: MIN_PER_PAGE - 1 },
      validations: [
        { field: 'perPage', rule: 'min', message: 'This value must be bigger or equal to: 20' },
      ],
    },
    {
      properties: { perPage: MAX_PER_PAGE + 1 },
      validations: [
        { field: 'perPage', rule: 'max', message: 'This value must be less or equal to: 50' },
      ],
    },
    // orderBy
    {
      properties: { orderBy: 1 },
      validations: [{ field: 'orderBy', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { orderBy: 'orderBy' },
      validations: [
        {
          field: 'orderBy',
          rule: 'in',
          message: 'This value must be in: customerId, paymentMethod, createdAt, updatedAt',
        },
      ],
    },
    // order
    {
      properties: { order: 1 },
      validations: [{ field: 'order', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { order: 'order' },
      validations: [{ field: 'order', rule: 'in', message: 'This value must be in: asc, desc' }],
    },
    // customerId
    {
      properties: { filters: '["=", "customerId", 1]' },
      validations: [
        { field: 'filters.customerId.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "customerId", "invalid_uuid"]' },
      validations: [
        {
          field: 'filters.customerId.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
        },
      ],
    },
    // paymentMethod
    {
      properties: { filters: '["=", "paymentMethod", 1]' },
      validations: [
        {
          field: 'filters.paymentMethod.0',
          rule: 'string',
          message: 'This value must be a string',
        },
      ],
    },
    {
      properties: { filters: '["=", "paymentMethod", "invalid_paymentMethod"]' },
      validations: [
        {
          field: 'filters.paymentMethod.0',
          rule: 'in',
          message: 'This value must be in: CARD_PAYMENT, PHONE_PAYMENT',
        },
      ],
    },
    // createUserId
    {
      properties: { filters: '["=", "createUserId", 1]' },
      validations: [
        { field: 'filters.createUserId.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "createUserId", "invalid_uuid"]' },
      validations: [
        {
          field: 'filters.createUserId.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
        },
      ],
    },
    // updateUserId
    {
      properties: { filters: '["=", "updateUserId", 1]' },
      validations: [
        { field: 'filters.updateUserId.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "updateUserId", "invalid_uuid"]' },
      validations: [
        {
          field: 'filters.updateUserId.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
        },
      ],
    },
    // createdAt
    {
      properties: { filters: '["=", "createdAt", 1]' },
      validations: [
        { field: 'filters.createdAt.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "createdAt", "invalid_date"]' },
      validations: [
        {
          field: 'filters.createdAt.0',
          rule: 'date',
          message: 'This value must be a valid date',
        },
      ],
    },
    // updatedAt
    {
      properties: { filters: '["=", "updatedAt", 1]' },
      validations: [
        { field: 'filters.updatedAt.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "updatedAt", "invalid_date"]' },
      validations: [
        {
          field: 'filters.updatedAt.0',
          rule: 'date',
          message: 'This value must be a valid date',
        },
      ],
    },
  ])(
    'Should throw ValidationException for every paymentProfile invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut();

        const requestModel = {
          filters: '[]',
          ...properties,
        } as ListPaymentProfileUseCase.RequestModel;

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

import { MAX_PER_PAGE, MIN_PER_PAGE } from '@/data/constants';
import { DbListOrderUseCase } from '@/data/use-cases';
import { OrderModel } from '@/domain/models';
import { ListOrderUseCase } from '@/domain/use-cases';
import { MAX_INTEGER } from '@/main/constants';
import { ValidationException } from '@/main/exceptions';
import { makeOrderRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

function makeSut() {
  const orderRepository = makeOrderRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbListOrderUseCase(orderRepository, validatorService);

  return { orderRepository, validatorService, sut };
}

describe(DbListOrderUseCase.name, () => {
  test('Should list order and return correct values', async () => {
    const { orderRepository, validatorService, sut } = makeSut();

    const requestModel = {
      page: 1,
      perPage: 20,
      orderBy: 'customerId' as const,
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
    const existsOrder = { ...responseModel };

    orderRepository.list.mockReturnValueOnce([existsOrder]);

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
            values: ['customerId', 'paymentProfileId', 'totalValue', 'createdAt', 'updatedAt'],
          }),
        ],
        order: [
          validatorService.rules.string(),
          validatorService.rules.in({ values: ['asc', 'desc'] }),
        ],
        filters: [
          validatorService.rules.listFilters<Omit<OrderModel, 'id' | 'deleteUserId' | 'deletedAt'>>(
            {
              schema: {
                customerId: [
                  validatorService.rules.array({
                    rules: [
                      validatorService.rules.string(),
                      validatorService.rules.regex({ pattern: 'uuidV4' }),
                    ],
                  }),
                ],
                paymentProfileId: [
                  validatorService.rules.array({
                    rules: [
                      validatorService.rules.string(),
                      validatorService.rules.regex({ pattern: 'uuidV4' }),
                    ],
                  }),
                ],
                totalValue: [
                  validatorService.rules.array({
                    rules: [
                      validatorService.rules.integer(),
                      validatorService.rules.max({ value: MAX_INTEGER }),
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
            },
          ),
        ],
      },
      model: sanitizedRequestModel,
      data: {},
    });
    expect(orderRepository.list).toBeCalledWith(sanitizedRequestModel);
  });

  describe.each([
    // page
    {
      properties: { page: 'page' },
      validations: [{ field: 'page', rule: 'integer', message: 'This value must be an integer' }],
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
      validations: [
        { field: 'perPage', rule: 'integer', message: 'This value must be an integer' },
      ],
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
          message:
            'This value must be in: customerId, paymentProfileId, totalValue, createdAt, updatedAt',
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
    // paymentProfileId
    {
      properties: { filters: '["=", "paymentProfileId", 1]' },
      validations: [
        {
          field: 'filters.paymentProfileId.0',
          rule: 'string',
          message: 'This value must be a string',
        },
      ],
    },
    {
      properties: { filters: '["=", "paymentProfileId", "invalid_uuid"]' },
      validations: [
        {
          field: 'filters.paymentProfileId.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
        },
      ],
    },
    // totalValue
    {
      properties: { filters: '["=", "totalValue", 1.2]' },
      validations: [
        {
          field: 'filters.totalValue.0',
          rule: 'integer',
          message: 'This value must be an integer',
        },
      ],
    },
    {
      properties: { filters: `["=", "totalValue", ${MAX_INTEGER + 1}]` },
      validations: [
        {
          field: 'filters.totalValue.0',
          rule: 'max',
          message: `This value must be less or equal to: ${MAX_INTEGER}`,
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
    'Should throw ValidationException for every order invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut();

        const requestModel = {
          filters: '[]',
          ...properties,
        } as ListOrderUseCase.RequestModel;

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

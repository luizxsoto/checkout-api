import { DbListProductUseCase } from '@/data/use-cases';
import { ProductModel } from '@/domain/models';
import { ListProductUseCase } from '@/domain/use-cases';
import { MAX_INTEGER } from '@/main/constants';
import { ValidationException } from '@/main/exceptions';
import { makeProductRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

function makeSut() {
  const productRepository = makeProductRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbListProductUseCase(productRepository, validatorService);

  return { productRepository, validatorService, sut };
}

describe(DbListProductUseCase.name, () => {
  test('Should list product and return correct values', async () => {
    const { productRepository, validatorService, sut } = makeSut();

    const requestModel = {
      page: 1,
      perPage: 20,
      orderBy: 'name' as const,
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
    const existsProduct = { ...responseModel };

    productRepository.list.mockReturnValueOnce([existsProduct]);

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
            values: ['name', 'category', 'price', 'createdAt', 'updatedAt'],
          }),
        ],
        order: [
          validatorService.rules.string(),
          validatorService.rules.in({ values: ['asc', 'desc'] }),
        ],
        filters: [
          validatorService.rules.listFilters<
            Omit<ProductModel, 'id' | 'deleteUserId' | 'deletedAt'>
          >({
            schema: {
              name: [
                validatorService.rules.array({
                  rules: [
                    validatorService.rules.string(),
                    validatorService.rules.length({ minLength: 6, maxLength: 255 }),
                  ],
                }),
              ],
              category: [
                validatorService.rules.array({
                  rules: [
                    validatorService.rules.string(),
                    validatorService.rules.in({ values: ['clothes', 'shoes', 'others'] }),
                  ],
                }),
              ],
              price: [
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
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: {},
    });
    expect(productRepository.list).toBeCalledWith(sanitizedRequestModel);
  });

  describe.each([
    // page
    {
      properties: { page: 'page' },
      validations: [{ field: 'page', rule: 'number', message: 'This value must be a number' }],
    },
    {
      properties: { page: 0 },
      validations: [{ field: 'page', rule: 'min', message: 'This value must be bigger than: 1' }],
    },
    // perPage
    {
      properties: { perPage: 'perPage' },
      validations: [{ field: 'perPage', rule: 'number', message: 'This value must be a number' }],
    },
    {
      properties: { perPage: 19 },
      validations: [
        { field: 'perPage', rule: 'min', message: 'This value must be bigger than: 20' },
      ],
    },
    {
      properties: { perPage: 51 },
      validations: [
        { field: 'perPage', rule: 'max', message: 'This value must be smaller than: 50' },
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
          message: 'This value must be in: name, category, price, createdAt, updatedAt',
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
    // name
    {
      properties: { filters: '["=", "name", 1]' },
      validations: [
        { field: 'filters.name.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "name", "lower"]' },
      validations: [
        {
          field: 'filters.name.0',
          rule: 'length',
          message: 'This value length must be beetween 6 and 255',
        },
      ],
    },
    {
      properties: {
        filters:
          '["=", "name", "BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName Bigg"]',
      },
      validations: [
        {
          field: 'filters.name.0',
          rule: 'length',
          message: 'This value length must be beetween 6 and 255',
        },
      ],
    },
    // category
    {
      properties: { filters: '["=", "category", 1]' },
      validations: [
        { field: 'filters.category.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "category", "invalid_category"]' },
      validations: [
        {
          field: 'filters.category.0',
          rule: 'in',
          message: 'This value must be in: clothes, shoes, others',
        },
      ],
    },
    // price
    {
      properties: { filters: '["=", "price", 1.2]' },
      validations: [
        { field: 'filters.price.0', rule: 'integer', message: 'This value must be an integer' },
      ],
    },
    {
      properties: { filters: `["=", "price", ${MAX_INTEGER + 1}]` },
      validations: [
        {
          field: 'filters.price.0',
          rule: 'max',
          message: `This value must be smaller than: ${MAX_INTEGER}`,
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
    'Should throw ValidationException for every product invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut();

        const requestModel = {
          filters: '[]',
          ...properties,
        } as ListProductUseCase.RequestModel;

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

import { DbUpdateProductUseCase } from '@/data/use-cases';
import { UpdateProductUseCase } from '@/domain/use-cases';
import { MAX_INTEGER } from '@/main/constants';
import { ValidationException } from '@/main/exceptions';
import { makeProductRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';
const nonExistentId = '00000000-0000-4000-8000-000000000002';

function makeSut() {
  const productRepository = makeProductRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbUpdateProductUseCase(productRepository, productRepository, validatorService);

  return { productRepository, validatorService, sut };
}

describe(DbUpdateProductUseCase.name, () => {
  test('Should update product and return correct values', async () => {
    const { productRepository, validatorService, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      name: 'Any Name',
      category: 'others' as const,
      price: 1000,
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = {
      ...requestModel,
    };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = { ...sanitizedRequestModel, updatedAt: new Date() };
    const existsProduct = { ...responseModel };

    productRepository.findBy.mockReturnValueOnce([existsProduct]);
    productRepository.update.mockReturnValueOnce([responseModel]);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        id: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        name: [
          validatorService.rules.string(),
          validatorService.rules.length({ minLength: 6, maxLength: 255 }),
        ],
        category: [
          validatorService.rules.string(),
          validatorService.rules.in({ values: ['clothes', 'shoes', 'others'] }),
        ],
        price: [
          validatorService.rules.integer(),
          validatorService.rules.max({ value: MAX_INTEGER }),
        ],
      },
      model: sanitizedRequestModel,
      data: { products: [] },
    });
    expect(productRepository.findBy).toBeCalledWith([{ id: sanitizedRequestModel.id }]);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        id: [
          validatorService.rules.exists({
            dataEntity: 'products',
            props: [{ modelKey: 'id', dataKey: 'id' }],
          }),
        ],
        name: [],
        category: [],
        price: [],
      },
      model: sanitizedRequestModel,
      data: { products: [existsProduct] },
    });
    expect(productRepository.update).toBeCalledWith(
      { id: sanitizedRequestModel.id },
      sanitizedRequestModel,
    );
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
    // name
    {
      properties: { name: 1 },
      validations: [{ field: 'name', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { name: 'lower' },
      validations: [
        { field: 'name', rule: 'length', message: 'This value length must be beetween 6 and 255' },
      ],
    },
    {
      properties: {
        name: 'BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName Bigg',
      },
      validations: [
        { field: 'name', rule: 'length', message: 'This value length must be beetween 6 and 255' },
      ],
    },
    // category
    {
      properties: { category: 1 },
      validations: [{ field: 'category', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { category: 'invalid_category' },
      validations: [
        {
          field: 'category',
          rule: 'in',
          message: 'This value must be in: clothes, shoes, others',
        },
      ],
    },
    // price
    {
      properties: { price: 1.2 },
      validations: [{ field: 'price', rule: 'integer', message: 'This value must be an integer' }],
    },
    {
      properties: { price: MAX_INTEGER + 1 },
      validations: [
        {
          field: 'price',
          rule: 'max',
          message: `This value must be less or equal to: ${MAX_INTEGER}`,
        },
      ],
    },
  ])(
    'Should throw ValidationException for every product invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut();

        const requestModel = {
          id: validUuidV4,
          name: 'Any Name',
          category: 'others',
          price: 1000,
          ...properties,
        } as UpdateProductUseCase.RequestModel;

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

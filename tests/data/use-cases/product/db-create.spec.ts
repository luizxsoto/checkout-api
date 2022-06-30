import { DbCreateProductUseCase } from '@/data/use-cases';
import { CreateProductUseCase } from '@/domain/use-cases';
import { MAX_INTEGER } from '@/main/constants';
import { ValidationException } from '@/main/exceptions';
import { makeProductRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

function makeSut() {
  const productRepository = makeProductRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbCreateProductUseCase(productRepository, validatorService);

  return { productRepository, validatorService, sut };
}

describe(DbCreateProductUseCase.name, () => {
  test('Should create product and return correct values', async () => {
    const { productRepository, validatorService, sut } = makeSut();

    const requestModel = {
      name: 'Any Name',
      category: 'others' as const,
      price: 1000,
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = {
      ...requestModel,
    };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = { ...sanitizedRequestModel, id: 'any_id', createdAt: new Date() };

    productRepository.create.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        name: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.length({ minLength: 6, maxLength: 255 }),
        ],
        category: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.in({ values: ['clothes', 'shoes', 'others'] }),
        ],
        price: [
          validatorService.rules.required(),
          validatorService.rules.integer(),
          validatorService.rules.max({ value: MAX_INTEGER }),
        ],
      },
      model: sanitizedRequestModel,
      data: { products: [] },
    });
    expect(productRepository.create).toBeCalledWith(sanitizedRequestModel);
  });

  describe.each([
    // name
    {
      properties: { name: undefined },
      validations: [{ field: 'name', rule: 'required', message: 'This value is required' }],
    },
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
      properties: { category: undefined },
      validations: [{ field: 'category', rule: 'required', message: 'This value is required' }],
    },
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
      properties: { price: undefined },
      validations: [{ field: 'price', rule: 'required', message: 'This value is required' }],
    },
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
          message: `This value must be smaller than: ${MAX_INTEGER}`,
        },
      ],
    },
  ])(
    'Should throw ValidationException for every product invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut();

        const requestModel = {
          name: 'Any Name',
          category: 'others',
          price: 1000,
          ...properties,
        } as CreateProductUseCase.RequestModel;

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

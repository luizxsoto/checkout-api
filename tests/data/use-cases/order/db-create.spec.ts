import { DbCreateOrderUseCase } from '@/data/use-cases';
import { CreateOrderUseCase } from '@/domain/use-cases';
import { MAX_INTEGER } from '@/main/constants';
import { ValidationException } from '@/main/exceptions';
import {
  makeOrderItemRepositoryStub,
  makeOrderRepositoryStub,
  makePaymentProfileRepositoryStub,
  makeProductRepositoryStub,
} from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';
import { makePaymentProfileModelMock, makeProductModelMock } from '@tests/domain/mocks/models';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';
const nonExistentId = '00000000-0000-4000-8000-000000000002';

function makeSut() {
  const orderRepository = makeOrderRepositoryStub();
  const orderItemRepository = makeOrderItemRepositoryStub();
  const paymentProfileRepository = makePaymentProfileRepositoryStub();
  const productRepository = makeProductRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbCreateOrderUseCase(
    orderRepository,
    orderItemRepository,
    paymentProfileRepository,
    productRepository,
    validatorService,
  );

  return {
    orderRepository,
    orderItemRepository,
    paymentProfileRepository,
    productRepository,
    validatorService,
    sut,
  };
}

describe(DbCreateOrderUseCase.name, () => {
  test('Should create order and return correct values', async () => {
    const {
      orderRepository,
      orderItemRepository,
      paymentProfileRepository,
      productRepository,
      validatorService,
      sut,
    } = makeSut();

    const requestModel = {
      userId: validUuidV4,
      paymentProfileId: validUuidV4,
      anyWrongProp: 'anyValue',
      orderItems: [{ productId: validUuidV4, quantity: 1, anyWrongProp: 'anyValue' }],
    };
    const sanitizedRequestModel = {
      ...requestModel,
      orderItems: [{ ...requestModel.orderItems[0] }],
    };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    Reflect.deleteProperty(sanitizedRequestModel.orderItems[0], 'anyWrongProp');
    const orderWithValues = {
      ...sanitizedRequestModel,
      totalValue: 1000,
    };
    Reflect.deleteProperty(orderWithValues, 'orderItems');
    const orderItemWithValues = {
      ...sanitizedRequestModel.orderItems[0],
      unitValue: 1000,
      totalValue: 1000,
    };
    const orderCreated = {
      ...orderWithValues,
      id: 'any_id',
      createdAt: new Date(),
    };
    const orderItemCreated = {
      ...orderItemWithValues,
      orderId: 'any_id',
      id: 'any_id',
      createdAt: new Date(),
    };
    const responseModel = { ...orderCreated, orderItems: [orderItemCreated] };
    const paymentProfile = makePaymentProfileModelMock();
    const product = makeProductModelMock();

    paymentProfileRepository.findBy.mockReturnValueOnce([paymentProfile]);
    productRepository.findBy.mockReturnValueOnce([product]);
    orderRepository.create.mockReturnValueOnce(orderCreated);
    orderItemRepository.create.mockReturnValueOnce(orderItemCreated);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        userId: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        paymentProfileId: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        orderItems: [
          validatorService.rules.required(),
          validatorService.rules.array({
            rules: [
              validatorService.rules.object({
                schema: {
                  productId: [
                    validatorService.rules.required(),
                    validatorService.rules.string(),
                    validatorService.rules.regex({ pattern: 'uuidV4' }),
                  ],
                  quantity: [
                    validatorService.rules.required(),
                    validatorService.rules.integer(),
                    validatorService.rules.min({ value: 1 }),
                    validatorService.rules.max({ value: MAX_INTEGER }),
                  ],
                },
              }),
            ],
          }),
          validatorService.rules.distinct({
            keys: ['productId'],
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: { paymentProfiles: [], products: [] },
    });
    expect(paymentProfileRepository.findBy).toBeCalledWith([
      { id: sanitizedRequestModel.paymentProfileId, userId: sanitizedRequestModel.userId },
    ]);
    expect(productRepository.findBy).toBeCalledWith([
      { id: sanitizedRequestModel.orderItems[0].productId },
    ]);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        userId: [
          validatorService.rules.exists({
            dataEntity: 'paymentProfiles',
            props: [
              { modelKey: 'userId', dataKey: 'userId' },
              { modelKey: 'paymentProfileId', dataKey: 'id' },
            ],
          }),
        ],
        paymentProfileId: [
          validatorService.rules.exists({
            dataEntity: 'paymentProfiles',
            props: [
              { modelKey: 'userId', dataKey: 'userId' },
              { modelKey: 'paymentProfileId', dataKey: 'id' },
            ],
          }),
        ],
        orderItems: [
          validatorService.rules.array({
            rules: [
              validatorService.rules.object({
                schema: {
                  productId: [
                    validatorService.rules.exists({
                      dataEntity: 'products',
                      props: [{ modelKey: 'productId', dataKey: 'id' }],
                    }),
                  ],
                  quantity: [],
                },
              }),
            ],
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: { paymentProfiles: [paymentProfile], products: [product] },
    });
    expect(orderRepository.create).toBeCalledWith(orderWithValues);
    expect(orderItemRepository.create).toBeCalledWith({
      ...orderItemWithValues,
      orderId: 'any_id',
    });
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
      properties: { userId: nonExistentId },
      validations: [
        { field: 'userId', rule: 'exists', message: 'This value was not found' },
        { field: 'paymentProfileId', rule: 'exists', message: 'This value was not found' },
      ],
    },
    // paymentProfileId
    {
      properties: { paymentProfileId: undefined },
      validations: [
        { field: 'paymentProfileId', rule: 'required', message: 'This value is required' },
      ],
    },
    {
      properties: { paymentProfileId: 1 },
      validations: [
        { field: 'paymentProfileId', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { paymentProfileId: 'invalid_id' },
      validations: [
        {
          field: 'paymentProfileId',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
        },
      ],
    },
    {
      properties: { paymentProfileId: nonExistentId },
      validations: [
        { field: 'userId', rule: 'exists', message: 'This value was not found' },
        { field: 'paymentProfileId', rule: 'exists', message: 'This value was not found' },
      ],
    },
    // orderItems
    {
      properties: { orderItems: undefined },
      validations: [{ field: 'orderItems', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: {
        orderItems: [
          { productId: validUuidV4, quantity: 1 },
          { productId: validUuidV4, quantity: 1 },
        ],
      },
      validations: [
        {
          field: 'orderItems',
          rule: 'distinct',
          message: 'This value cannot have duplicate items by: productId',
        },
      ],
    },
    // orderItems.0.productId
    {
      properties: { orderItems: [{ productId: undefined, quantity: 1 }] },
      validations: [
        { field: 'orderItems.0.productId', rule: 'required', message: 'This value is required' },
      ],
    },
    {
      properties: { orderItems: [{ productId: 1, quantity: 1 }] },
      validations: [
        { field: 'orderItems.0.productId', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { orderItems: [{ productId: 'invalid_id', quantity: 1 }] },
      validations: [
        {
          field: 'orderItems.0.productId',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
        },
      ],
    },
    {
      properties: { orderItems: [{ productId: nonExistentId, quantity: 1 }] },
      validations: [
        { field: 'orderItems.0.productId', rule: 'exists', message: 'This value was not found' },
      ],
    },
    // orderItems.0.quantity
    {
      properties: { orderItems: [{ productId: validUuidV4, quantity: undefined }] },
      validations: [
        { field: 'orderItems.0.quantity', rule: 'required', message: 'This value is required' },
      ],
    },
    {
      properties: { orderItems: [{ productId: validUuidV4, quantity: 1.2 }] },
      validations: [
        {
          field: 'orderItems.0.quantity',
          rule: 'integer',
          message: 'This value must be an integer',
        },
      ],
    },
    {
      properties: { orderItems: [{ productId: validUuidV4, quantity: 0 }] },
      validations: [
        {
          field: 'orderItems.0.quantity',
          rule: 'min',
          message: 'This value must be bigger or equal to: 1',
        },
      ],
    },
    {
      properties: { orderItems: [{ productId: validUuidV4, quantity: MAX_INTEGER + 1 }] },
      validations: [
        {
          field: 'orderItems.0.quantity',
          rule: 'max',
          message: `This value must be less or equal to: ${MAX_INTEGER}`,
        },
      ],
    },
  ])(
    'Should throw ValidationException for every order invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut();

        const requestModel = {
          userId: validUuidV4,
          paymentProfileId: validUuidV4,
          orderItems: [{ productId: validUuidV4, quantity: 1 }],
          ...properties,
        } as CreateOrderUseCase.RequestModel;

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

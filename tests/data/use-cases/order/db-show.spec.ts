import { DbShowOrderUseCase } from '@/data/use-cases';
import { ShowOrderUseCase } from '@/domain/use-cases';
import { ValidationException } from '@/main/exceptions';
import {
  makeOrderItemRepositoryStub,
  makeOrderRepositoryStub,
} from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';
const nonExistentId = '00000000-0000-4000-8000-000000000002';

function makeSut() {
  const orderRepository = makeOrderRepositoryStub();
  const orderItemRepository = makeOrderItemRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbShowOrderUseCase(orderRepository, orderItemRepository, validatorService);

  return { orderRepository, orderItemRepository, validatorService, sut };
}

describe(DbShowOrderUseCase.name, () => {
  test('Should show order and return correct values', async () => {
    const { orderRepository, orderItemRepository, validatorService, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = { ...requestModel };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const existsOrder = { ...sanitizedRequestModel };
    const existsOrderItem = { ...sanitizedRequestModel };
    const responseModel = { ...existsOrder, orderItems: [existsOrderItem] };

    orderRepository.findBy.mockReturnValueOnce([existsOrder]);
    orderItemRepository.findBy.mockReturnValueOnce([existsOrderItem]);

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
      data: { orders: [] },
    });
    expect(orderRepository.findBy).toBeCalledWith([sanitizedRequestModel]);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        id: [
          validatorService.rules.exists({
            dataEntity: 'orders',
            props: [{ modelKey: 'id', dataKey: 'id' }],
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: { orders: [existsOrder] },
    });
    expect(orderItemRepository.findBy).toBeCalledWith([{ orderId: sanitizedRequestModel.id }]);
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
    'Should throw ValidationException for every order invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut();

        const requestModel = { ...properties } as ShowOrderUseCase.RequestModel;

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

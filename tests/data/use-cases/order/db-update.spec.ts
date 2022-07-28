import { DbUpdateOrderUseCase } from '@/data/use-cases';
import { UpdateOrderUseCase } from '@/domain/use-cases';
import { ValidationException } from '@/main/exceptions';
import { makeOrderRepositoryStub, makeUserRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';
import { makeUserModelMock } from '@tests/domain/mocks/models';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';
const nonExistentId = '00000000-0000-4000-8000-000000000002';

function makeSut() {
  const orderRepository = makeOrderRepositoryStub();
  const userRepository = makeUserRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbUpdateOrderUseCase(
    orderRepository,
    orderRepository,
    userRepository,
    validatorService,
  );

  return { orderRepository, userRepository, validatorService, sut };
}

describe(DbUpdateOrderUseCase.name, () => {
  test('Should update order and return correct values', async () => {
    const { orderRepository, userRepository, validatorService, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      userId: validUuidV4,
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = {
      ...requestModel,
    };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = { ...sanitizedRequestModel, updatedAt: new Date() };
    const existsOrder = { ...responseModel };
    const existsUser = makeUserModelMock();

    orderRepository.findBy.mockReturnValueOnce([existsOrder]);
    userRepository.findBy.mockReturnValueOnce([existsUser]);
    orderRepository.update.mockReturnValueOnce([responseModel]);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        id: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        userId: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
      },
      model: sanitizedRequestModel,
      data: { orders: [], users: [] },
    });
    expect(orderRepository.findBy).toBeCalledWith([{ id: sanitizedRequestModel.id }]);
    expect(userRepository.findBy).toBeCalledWith([{ id: sanitizedRequestModel.userId }], true);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        id: [
          validatorService.rules.exists({
            dataEntity: 'orders',
            props: [{ modelKey: 'id', dataKey: 'id' }],
          }),
        ],
        userId: [
          validatorService.rules.exists({
            dataEntity: 'users',
            props: [{ modelKey: 'userId', dataKey: 'id' }],
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: { orders: [existsOrder], users: [existsUser] },
    });
    expect(orderRepository.update).toBeCalledWith(
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
      properties: { userId: 'invalid_uuid' },
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
      validations: [{ field: 'userId', rule: 'exists', message: 'This value was not found' }],
    },
  ])(
    'Should throw ValidationException for every order invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut();

        const requestModel = {
          id: validUuidV4,
          userId: validUuidV4,
          ...properties,
        } as UpdateOrderUseCase.RequestModel;

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

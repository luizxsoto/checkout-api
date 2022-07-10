import { DbUpdateOrderUseCase } from '@/data/use-cases';
import { UpdateOrderUseCase } from '@/domain/use-cases';
import { ValidationException } from '@/main/exceptions';
import {
  makeOrderRepositoryStub,
  makePaymentProfileRepositoryStub,
} from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';
import { makePaymentProfileModelMock } from '@tests/domain/mocks/models';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';
const nonExistentId = '00000000-0000-4000-8000-000000000002';

function makeSut() {
  const orderRepository = makeOrderRepositoryStub();
  const paymentProfileRepository = makePaymentProfileRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbUpdateOrderUseCase(
    orderRepository,
    orderRepository,
    paymentProfileRepository,
    validatorService,
  );

  return { orderRepository, paymentProfileRepository, validatorService, sut };
}

describe(DbUpdateOrderUseCase.name, () => {
  test('Should update order and return correct values', async () => {
    const { orderRepository, paymentProfileRepository, validatorService, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      customerId: validUuidV4,
      paymentProfileId: validUuidV4,
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = {
      ...requestModel,
    };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = { ...sanitizedRequestModel, updatedAt: new Date() };
    const existsOrder = { ...responseModel };
    const existsPaymentProfile = makePaymentProfileModelMock();

    orderRepository.findBy.mockReturnValueOnce([existsOrder]);
    paymentProfileRepository.findBy.mockReturnValueOnce([existsPaymentProfile]);
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
        customerId: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        paymentProfileId: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
      },
      model: sanitizedRequestModel,
      data: { orders: [], paymentProfiles: [] },
    });
    expect(orderRepository.findBy).toBeCalledWith([{ id: sanitizedRequestModel.id }]);
    expect(paymentProfileRepository.findBy).toBeCalledWith([
      { id: sanitizedRequestModel.paymentProfileId, customerId: sanitizedRequestModel.customerId },
    ]);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        id: [
          validatorService.rules.exists({
            dataEntity: 'orders',
            props: [{ modelKey: 'id', dataKey: 'id' }],
          }),
        ],
        customerId: [
          validatorService.rules.exists({
            dataEntity: 'paymentProfiles',
            props: [
              { modelKey: 'customerId', dataKey: 'customerId' },
              { modelKey: 'paymentProfileId', dataKey: 'id' },
            ],
          }),
        ],
        paymentProfileId: [
          validatorService.rules.exists({
            dataEntity: 'paymentProfiles',
            props: [
              { modelKey: 'customerId', dataKey: 'customerId' },
              { modelKey: 'paymentProfileId', dataKey: 'id' },
            ],
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: { orders: [existsOrder], paymentProfiles: [existsPaymentProfile] },
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
      properties: { customerId: 'invalid_uuid' },
      validations: [
        {
          field: 'customerId',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
        },
      ],
    },
    {
      properties: { customerId: nonExistentId },
      validations: [
        { field: 'customerId', rule: 'exists', message: 'This value was not found' },
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
      properties: { paymentProfileId: 'invalid_uuid' },
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
        { field: 'customerId', rule: 'exists', message: 'This value was not found' },
        { field: 'paymentProfileId', rule: 'exists', message: 'This value was not found' },
      ],
    },
  ])(
    'Should throw ValidationException for every order invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut();

        const requestModel = {
          id: validUuidV4,
          customerId: validUuidV4,
          paymentProfileId: validUuidV4,
          ...properties,
        } as UpdateOrderUseCase.RequestModel;

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

import { DbRemoveCustomerUseCase } from '@/data/use-cases';
import { RemoveCustomerUseCase } from '@/domain/use-cases';
import { ValidationException } from '@/infra/exceptions';
import { makeCustomerRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';

function makeSut() {
  const customerRepository = makeCustomerRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbRemoveCustomerUseCase(customerRepository, customerRepository, validatorService);

  return { customerRepository, validatorService, sut };
}

describe(DbRemoveCustomerUseCase.name, () => {
  test('Should remove customer and return correct values', async () => {
    const { customerRepository, validatorService, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = { ...requestModel };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = { ...sanitizedRequestModel, updatedAt: new Date() };
    const existsCustomer = { ...responseModel };

    customerRepository.findBy.mockReturnValueOnce([existsCustomer]);
    customerRepository.remove.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel).catch();

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
      data: { customers: [] },
    });
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        id: [
          validatorService.rules.exists({
            dataEntity: 'customers',
            props: [{ modelKey: 'id', dataKey: 'id' }],
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: { customers: [existsCustomer] },
    });
    expect(customerRepository.findBy).toBeCalledWith([{ id: sanitizedRequestModel.id }]);
    expect(customerRepository.remove).toBeCalledWith({ id: sanitizedRequestModel.id });
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
  ])(
    'Should throw ValidationException for every customer invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { customerRepository, sut } = makeSut();

        const requestModel = { ...properties } as RemoveCustomerUseCase.RequestModel;
        const responseModel = { ...requestModel, deleteddAt: new Date() };

        customerRepository.findBy.mockReturnValueOnce([responseModel]);

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );

  test('Should throw ValidationException if id was not found', async () => {
    const { customerRepository, sut } = makeSut();

    const requestModel = { id: '00000000-0000-4000-8000-000000000002' };
    const responseModel = { ...requestModel, deletedAt: new Date() };

    customerRepository.findBy.mockReturnValueOnce([{ ...responseModel, id: validUuidV4 }]);

    const sutResult = await sut.execute(requestModel).catch((e) => e);

    expect(sutResult).toStrictEqual(
      new ValidationException([
        { field: 'id', rule: 'exists', message: 'This value was not found' },
      ]),
    );
  });
});

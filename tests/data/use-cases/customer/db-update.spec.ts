import { DbUpdateCustomerUseCase } from '@/data/use-cases';
import { makeCustomerRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

function makeSut() {
  const customerRepository = makeCustomerRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbUpdateCustomerUseCase(customerRepository, customerRepository, validatorService);

  return { customerRepository, validatorService, sut };
}

describe(DbUpdateCustomerUseCase.name, () => {
  test('Should update customer and return correct values', async () => {
    const { customerRepository, validatorService, sut } = makeSut();

    const requestModel = {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Any Name',
      email: 'any@email.com',
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = { ...requestModel };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = {
      ...sanitizedRequestModel,
      id: '00000000-0000-4000-8000-000000000001',
      updatedAt: new Date(),
    };

    customerRepository.findBy.mockReturnValueOnce([responseModel]);
    customerRepository.update.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel).catch();

    expect(sutResult).toStrictEqual(responseModel);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        id: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'uuidV4' }),
          validatorService.rules.exists({
            dataEntity: 'customersById',
            props: [{ modelKey: 'id', dataKey: 'id' }],
          }),
        ],
        name: [
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'name' }),
          validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'email' }),
          validatorService.rules.length({ minLength: 6, maxLength: 100 }),
          validatorService.rules.unique({
            dataEntity: 'customersByEmail',
            ignoreProps: [{ modelKey: 'id', dataKey: 'id' }],
            props: [{ modelKey: 'email', dataKey: 'email' }],
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: {
        customersById: expect.any(Function),
        customersByEmail: expect.any(Function),
      },
    });
    expect(customerRepository.update).toBeCalledWith(
      { id: sanitizedRequestModel.id },
      sanitizedRequestModel,
    );
    expect(customerRepository.findBy).toBeCalledWith({ email: sanitizedRequestModel.email });
  });
});

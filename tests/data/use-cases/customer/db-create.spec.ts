import { DbCreateCustomerUseCase } from '@/data/use-cases';
import { ValidationException } from '@/infra/exceptions';
import { makeCustomerRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';
import { makeCustomerModelMock } from '@tests/domain/mocks/models';

function makeSut() {
  const customerRepository = makeCustomerRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbCreateCustomerUseCase(customerRepository, customerRepository, validatorService);

  return { customerRepository, validatorService, sut };
}

describe(DbCreateCustomerUseCase.name, () => {
  test('Should create customer and return correct values', async () => {
    const { customerRepository, sut } = makeSut();

    const requestModel = { name: 'any_name', email: 'any@email.com' };
    const responseModel = { ...requestModel, id: 'any_id', createdAt: new Date() };

    customerRepository.create.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toBe(responseModel);
  });

  describe.each([
    // name
    {
      properties: { name: undefined, email: 'any@email.com' },
      validations: [{ field: 'name', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { name: 1, email: 'any@email.com' },
      validations: [{ field: 'name', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { name: ' InV@L1D n@m3 ', email: 'any@email.com' },
      validations: [
        {
          field: 'name',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: name',
        },
      ],
    },
    {
      properties: { name: 'lower', email: 'any@email.com' },
      validations: [
        { field: 'name', rule: 'length', message: 'This value length must be beetween 6 and 100' },
      ],
    },
    {
      properties: {
        name: 'BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName',
        email: 'any@email.com',
      },
      validations: [
        { field: 'name', rule: 'length', message: 'This value length must be beetween 6 and 100' },
      ],
    },
    // email
    {
      properties: { email: undefined },
      validations: [{ field: 'email', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { email: 1 },
      validations: [{ field: 'email', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { email: ' InV@L1D eM@1L ' },
      validations: [
        {
          field: 'email',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: email',
        },
      ],
    },
    {
      properties: {
        email:
          'biggest_email_biggest_email_biggest_email_biggest_email_biggest_email_biggest_email_biggest_email@invalid.com',
      },
      validations: [
        { field: 'email', rule: 'length', message: 'This value length must be beetween 6 and 100' },
      ],
    },
    {
      properties: { email: 'valid@email.com' },
      validations: [
        { field: 'email', rule: 'unique', message: 'This value has already been used' },
      ],
    },
  ])('Should validate every customer prop', ({ properties, validations }) => {
    it(JSON.stringify(validations), async () => {
      const { customerRepository, sut } = makeSut();

      const requestModel = makeCustomerModelMock(properties as any);
      const responseModel = { ...requestModel, id: 'any_id', createdAt: new Date() };

      customerRepository.create.mockReturnValueOnce(responseModel);

      const sutResult = await sut.execute(requestModel).catch((e) => e);

      expect(sutResult).toStrictEqual(new ValidationException(validations));
    });
  });
});

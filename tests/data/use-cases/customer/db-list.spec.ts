import { DbListCustomerUseCase } from '@/data/use-cases';
import { ValidationException } from '@/infra/exceptions';
import { makeCustomerRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

function makeSut() {
  const customerRepository = makeCustomerRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbListCustomerUseCase(customerRepository, validatorService);

  return { customerRepository, validatorService, sut };
}

describe(DbListCustomerUseCase.name, () => {
  test('Should list customer and return correct values', async () => {
    const { customerRepository, validatorService, sut } = makeSut();

    const requestModel = {
      name: 'Any Name',
      email: 'any@email.com',
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = { ...requestModel };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = { ...sanitizedRequestModel };
    const existsCustomer = { ...responseModel };

    customerRepository.findBy.mockReturnValueOnce([existsCustomer]);

    const sutResult = await sut.execute(requestModel).catch();

    expect(sutResult).toStrictEqual([responseModel]);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        name: [
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'name' }),
          validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'email' }),
          validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
      },
      model: sanitizedRequestModel,
      data: { customers: [] },
    });
    expect(customerRepository.findBy).toBeCalledWith(sanitizedRequestModel);
  });

  describe.each([
    // name
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
  ])(
    'Should throw ValidationException for every customer invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { customerRepository, sut } = makeSut();

        // eslint-disable-next-line prefer-object-spread
        const requestModel = Object.assign(
          { name: 'Any Name', email: 'any@email.com' },
          properties,
        );
        const responseModel = { ...requestModel };

        customerRepository.findBy.mockReturnValueOnce([responseModel]);

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

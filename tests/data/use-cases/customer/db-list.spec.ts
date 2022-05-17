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
      page: 1,
      perPage: 20,
      name: 'Any Name',
      email: 'any@email.com',
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = { ...requestModel };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = { ...sanitizedRequestModel };
    Reflect.deleteProperty(responseModel, 'page');
    Reflect.deleteProperty(responseModel, 'perPage');
    const existsCustomer = { ...responseModel };

    customerRepository.list.mockReturnValueOnce([existsCustomer]);

    const sutResult = await sut.execute(requestModel).catch();

    expect(sutResult).toStrictEqual([responseModel]);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        page: [validatorService.rules.number(), validatorService.rules.min({ value: 1 })],
        perPage: [
          validatorService.rules.number(),
          validatorService.rules.min({ value: 20 }),
          validatorService.rules.max({ value: 50 }),
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
        ],
      },
      model: sanitizedRequestModel,
      data: { customers: [] },
    });
    expect(customerRepository.list).toBeCalledWith(sanitizedRequestModel);
  });

  describe.each([
    // page
    {
      properties: { page: 'page' },
      validations: [{ field: 'page', rule: 'number', message: 'This value must be a number' }],
    },
    {
      properties: { page: 0 },
      validations: [{ field: 'page', rule: 'min', message: 'This value must be bigger than: 1' }],
    },
    // perPage
    {
      properties: { perPage: 'perPage' },
      validations: [{ field: 'perPage', rule: 'number', message: 'This value must be a number' }],
    },
    {
      properties: { perPage: 19 },
      validations: [
        { field: 'perPage', rule: 'min', message: 'This value must be bigger than: 20' },
      ],
    },
    {
      properties: { perPage: 51 },
      validations: [
        { field: 'perPage', rule: 'max', message: 'This value must be smaller than: 50' },
      ],
    },
    // name
    {
      properties: { name: 1 },
      validations: [{ field: 'name', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { name: ' InV@L1D n@m3 ' },
      validations: [
        {
          field: 'name',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: name',
        },
      ],
    },
    {
      properties: { name: 'lower' },
      validations: [
        { field: 'name', rule: 'length', message: 'This value length must be beetween 6 and 100' },
      ],
    },
    {
      properties: {
        name: 'BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName',
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
        const responseModel = { ...(requestModel as any) };

        customerRepository.findBy.mockReturnValueOnce([responseModel]);

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

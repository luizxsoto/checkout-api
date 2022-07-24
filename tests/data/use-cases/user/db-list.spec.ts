import { MAX_PER_PAGE, MIN_PER_PAGE } from '@/data/constants';
import { DbListUserUseCase } from '@/data/use-cases';
import { ListUserUseCase } from '@/domain/use-cases';
import { ValidationException } from '@/main/exceptions';
import {
  ArrayValidation,
  DateValidation,
  InValidation,
  IntegerValidation,
  LengthValidation,
  ListFiltersValidation,
  MaxValidation,
  MinValidation,
  ObjectValidation,
  RegexValidation,
  StringValidation,
} from '@/validation/validators';
import { makeUserRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidationServiceStub } from '@tests/data/stubs/services';

function makeSut() {
  const userRepository = makeUserRepositoryStub();
  const validationService = makeValidationServiceStub();
  const sut = new DbListUserUseCase(userRepository, validationService);

  return { userRepository, validationService, sut };
}

describe(DbListUserUseCase.name, () => {
  test('Should list user and return correct values', async () => {
    const { userRepository, validationService, sut } = makeSut();

    const requestModel = {
      page: 1,
      perPage: 20,
      orderBy: 'name' as const,
      order: 'asc' as const,
      filters: '[]',
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = { ...requestModel };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = { ...sanitizedRequestModel };
    Reflect.deleteProperty(responseModel, 'page');
    Reflect.deleteProperty(responseModel, 'perPage');
    Reflect.deleteProperty(responseModel, 'orderBy');
    Reflect.deleteProperty(responseModel, 'order');
    Reflect.deleteProperty(responseModel, 'filters');
    const existsUser = { ...responseModel };

    userRepository.list.mockReturnValueOnce([existsUser]);

    const sutResult = await sut.execute(requestModel);

    const filtersSchema: Record<string, [ArrayValidation.Validator]> = {
      name: [
        new ArrayValidation.Validator(
          {
            validations: [
              new StringValidation.Validator(),
              new RegexValidation.Validator({ pattern: 'name' }),
              new LengthValidation.Validator({ minLength: 6, maxLength: 100 }),
            ],
          },
          validationService,
        ),
      ],
      email: [
        new ArrayValidation.Validator(
          {
            validations: [
              new StringValidation.Validator(),
              new RegexValidation.Validator({ pattern: 'email' }),
              new LengthValidation.Validator({ minLength: 6, maxLength: 100 }),
            ],
          },
          validationService,
        ),
      ],
      createUserId: [
        new ArrayValidation.Validator(
          {
            validations: [
              new StringValidation.Validator(),
              new RegexValidation.Validator({ pattern: 'uuidV4' }),
            ],
          },
          validationService,
        ),
      ],
      updateUserId: [
        new ArrayValidation.Validator(
          {
            validations: [
              new StringValidation.Validator(),
              new RegexValidation.Validator({ pattern: 'uuidV4' }),
            ],
          },
          validationService,
        ),
      ],
      createdAt: [
        new ArrayValidation.Validator(
          {
            validations: [new StringValidation.Validator(), new DateValidation.Validator()],
          },
          validationService,
        ),
      ],
      updatedAt: [
        new ArrayValidation.Validator(
          {
            validations: [new StringValidation.Validator(), new DateValidation.Validator()],
          },
          validationService,
        ),
      ],
    };

    expect(sutResult).toStrictEqual([responseModel]);
    expect(validationService.validate).toBeCalledWith({
      schema: {
        page: [new IntegerValidation.Validator(), new MinValidation.Validator({ value: 1 })],
        perPage: [
          new IntegerValidation.Validator(),
          new MinValidation.Validator({ value: MIN_PER_PAGE }),
          new MaxValidation.Validator({ value: MAX_PER_PAGE }),
        ],
        orderBy: [
          new StringValidation.Validator(),
          new InValidation.Validator({ values: ['name', 'email', 'createdAt', 'updatedAt'] }),
        ],
        order: [
          new StringValidation.Validator(),
          new InValidation.Validator({ values: ['asc', 'desc'] }),
        ],
        filters: [
          new ListFiltersValidation.Validator(
            { schema: filtersSchema },
            new ObjectValidation.Validator({ schema: filtersSchema }, validationService),
          ),
        ],
      },
      model: sanitizedRequestModel,
      data: {},
    });
    expect(userRepository.list).toBeCalledWith(sanitizedRequestModel);
  });

  describe.each([
    // page
    {
      properties: { page: 'page' },
      validations: [{ field: 'page', rule: 'integer', message: 'This value must be an integer' }],
    },
    {
      properties: { page: 0 },
      validations: [
        { field: 'page', rule: 'min', message: 'This value must be bigger or equal to: 1' },
      ],
    },
    // perPage
    {
      properties: { perPage: 'perPage' },
      validations: [
        { field: 'perPage', rule: 'integer', message: 'This value must be an integer' },
      ],
    },
    {
      properties: { perPage: MIN_PER_PAGE - 1 },
      validations: [
        { field: 'perPage', rule: 'min', message: 'This value must be bigger or equal to: 20' },
      ],
    },
    {
      properties: { perPage: MAX_PER_PAGE + 1 },
      validations: [
        { field: 'perPage', rule: 'max', message: 'This value must be less or equal to: 50' },
      ],
    },
    // orderBy
    {
      properties: { orderBy: 1 },
      validations: [{ field: 'orderBy', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { orderBy: 'orderBy' },
      validations: [
        {
          field: 'orderBy',
          rule: 'in',
          message: 'This value must be in: name, email, createdAt, updatedAt',
        },
      ],
    },
    // order
    {
      properties: { order: 1 },
      validations: [{ field: 'order', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { order: 'order' },
      validations: [{ field: 'order', rule: 'in', message: 'This value must be in: asc, desc' }],
    },
    // name
    {
      properties: { filters: '["=", "name", 1]' },
      validations: [
        { field: 'filters.name.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "name", " InV@L1D n@m3 "]' },
      validations: [
        {
          field: 'filters.name.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: name',
          details: {
            pattern: '/^([a-zA-Z\\u00C0-\\u00FF]+\\s)*[a-zA-Z\\u00C0-\\u00FF]+$/',
          },
        },
      ],
    },
    {
      properties: { filters: '["=", "name", "lower"]' },
      validations: [
        {
          field: 'filters.name.0',
          rule: 'length',
          message: 'This value length must be beetween 6 and 100',
        },
      ],
    },
    {
      properties: {
        filters:
          '["=", "name", "BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName"]',
      },
      validations: [
        {
          field: 'filters.name.0',
          rule: 'length',
          message: 'This value length must be beetween 6 and 100',
        },
      ],
    },
    // email
    {
      properties: { filters: '["=", "email", 1]' },
      validations: [
        { field: 'filters.email.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "email", " InV@L1D eM@1L "]' },
      validations: [
        {
          field: 'filters.email.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: email',
          details: {
            pattern: '/^[\\w+.]+@\\w+\\.\\w{2,}(?:\\.\\w{2})?$/',
          },
        },
      ],
    },
    {
      properties: {
        filters:
          '["=", "email", "biggest_email_biggest_email_biggest_email_biggest_email_biggest_email_biggest_email_biggest_email@invalid.com"]',
      },
      validations: [
        {
          field: 'filters.email.0',
          rule: 'length',
          message: 'This value length must be beetween 6 and 100',
        },
      ],
    },
    // createUserId
    {
      properties: { filters: '["=", "createUserId", 1]' },
      validations: [
        { field: 'filters.createUserId.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "createUserId", "invalid_uuid"]' },
      validations: [
        {
          field: 'filters.createUserId.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
          details: {
            pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i',
          },
        },
      ],
    },
    // updateUserId
    {
      properties: { filters: '["=", "updateUserId", 1]' },
      validations: [
        { field: 'filters.updateUserId.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "updateUserId", "invalid_uuid"]' },
      validations: [
        {
          field: 'filters.updateUserId.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
          details: {
            pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i',
          },
        },
      ],
    },
    // createdAt
    {
      properties: { filters: '["=", "createdAt", 1]' },
      validations: [
        { field: 'filters.createdAt.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "createdAt", "invalid_date"]' },
      validations: [
        {
          field: 'filters.createdAt.0',
          rule: 'date',
          message: 'This value must be a valid date',
        },
      ],
    },
    // updatedAt
    {
      properties: { filters: '["=", "updatedAt", 1]' },
      validations: [
        { field: 'filters.updatedAt.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "updatedAt", "invalid_date"]' },
      validations: [
        {
          field: 'filters.updatedAt.0',
          rule: 'date',
          message: 'This value must be a valid date',
        },
      ],
    },
  ])(
    'Should throw ValidationException for every user invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { userRepository, sut } = makeSut();

        const requestModel = {
          filters: '[]',
          ...properties,
        } as ListUserUseCase.RequestModel;

        userRepository.list.mockReturnValueOnce([]);

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

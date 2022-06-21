import { DbListUserUseCase } from '@/data/use-cases';
import { UserModel } from '@/domain/models';
import { ListUserUseCase } from '@/domain/use-cases';
import { ValidationException } from '@/main/exceptions';
import { makeUserRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

function makeSut() {
  const userRepository = makeUserRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbListUserUseCase(userRepository, validatorService);

  return { userRepository, validatorService, sut };
}

describe(DbListUserUseCase.name, () => {
  test('Should list user and return correct values', async () => {
    const { userRepository, validatorService, sut } = makeSut();

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
        orderBy: [
          validatorService.rules.string(),
          validatorService.rules.in({ values: ['name', 'email', 'createdAt', 'updatedAt'] }),
        ],
        order: [
          validatorService.rules.string(),
          validatorService.rules.in({ values: ['asc', 'desc'] }),
        ],
        filters: [
          validatorService.rules.listFilters<
            Omit<UserModel, 'id' | 'password' | 'roles' | 'deletedAt'>
          >({
            schema: {
              name: [
                validatorService.rules.array({
                  rules: [
                    validatorService.rules.string(),
                    validatorService.rules.regex({ pattern: 'name' }),
                    validatorService.rules.length({ minLength: 6, maxLength: 100 }),
                  ],
                }),
              ],
              email: [
                validatorService.rules.array({
                  rules: [
                    validatorService.rules.string(),
                    validatorService.rules.regex({ pattern: 'email' }),
                    validatorService.rules.length({ minLength: 6, maxLength: 100 }),
                  ],
                }),
              ],
              createUserId: [
                validatorService.rules.array({
                  rules: [
                    validatorService.rules.string(),
                    validatorService.rules.regex({ pattern: 'uuidV4' }),
                  ],
                }),
              ],
              updateUserId: [
                validatorService.rules.array({
                  rules: [
                    validatorService.rules.string(),
                    validatorService.rules.regex({ pattern: 'uuidV4' }),
                  ],
                }),
              ],
              createdAt: [
                validatorService.rules.array({
                  rules: [validatorService.rules.string(), validatorService.rules.date()],
                }),
              ],
              updatedAt: [
                validatorService.rules.array({
                  rules: [validatorService.rules.string(), validatorService.rules.date()],
                }),
              ],
            },
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: { users: [] },
    });
    expect(userRepository.list).toBeCalledWith(sanitizedRequestModel);
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
      validations: [{ field: 'name.0', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { filters: '["=", "name", " InV@L1D n@m3 "]' },
      validations: [
        {
          field: 'name.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: name',
        },
      ],
    },
    {
      properties: { filters: '["=", "name", "lower"]' },
      validations: [
        {
          field: 'name.0',
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
          field: 'name.0',
          rule: 'length',
          message: 'This value length must be beetween 6 and 100',
        },
      ],
    },
    // email
    {
      properties: { filters: '["=", "email", 1]' },
      validations: [{ field: 'email.0', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { filters: '["=", "email", " InV@L1D eM@1L "]' },
      validations: [
        {
          field: 'email.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: email',
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
          field: 'email.0',
          rule: 'length',
          message: 'This value length must be beetween 6 and 100',
        },
      ],
    },
    // createUserId
    {
      properties: { filters: '["=", "createUserId", 1]' },
      validations: [
        { field: 'createUserId.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "createUserId", "invalid_uuid"]' },
      validations: [
        {
          field: 'createUserId.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
        },
      ],
    },
    // updateUserId
    {
      properties: { filters: '["=", "updateUserId", 1]' },
      validations: [
        { field: 'updateUserId.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "updateUserId", "invalid_uuid"]' },
      validations: [
        {
          field: 'updateUserId.0',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
        },
      ],
    },
    // createdAt
    {
      properties: { filters: '["=", "createdAt", 1]' },
      validations: [
        { field: 'createdAt.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "createdAt", "invalid_date"]' },
      validations: [
        {
          field: 'createdAt.0',
          rule: 'date',
          message: 'This value must be a valid date',
        },
      ],
    },
    // updatedAt
    {
      properties: { filters: '["=", "updatedAt", 1]' },
      validations: [
        { field: 'updatedAt.0', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { filters: '["=", "updatedAt", "invalid_date"]' },
      validations: [
        {
          field: 'updatedAt.0',
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

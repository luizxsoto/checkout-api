import { DbUpdateUserUseCase } from '@/data/use-cases';
import { UpdateUserUseCase } from '@/domain/use-cases';
import { ValidationException } from '@/main/exceptions';
import { makeHasherCryptographyStub } from '@tests/data/stubs/cryptography';
import { makeUserRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';
const nonExistentId = '00000000-0000-4000-8000-000000000002';

function makeSut() {
  const userRepository = makeUserRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const hasherCryptography = makeHasherCryptographyStub();
  const sut = new DbUpdateUserUseCase(
    userRepository,
    userRepository,
    validatorService,
    hasherCryptography,
  );

  return { userRepository, validatorService, hasherCryptography, sut };
}

describe(DbUpdateUserUseCase.name, () => {
  test('Should update user and return correct values', async () => {
    const { userRepository, validatorService, hasherCryptography, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      name: 'Any Name',
      email: 'any@email.com',
      password: 'Password@123',
      roles: [],
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = {
      ...requestModel,
    };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = {
      ...sanitizedRequestModel,
      updatedAt: new Date(),
      password: 'hashed_password',
    };
    const existsUser = { ...responseModel };
    const otherUser = { ...responseModel, email: 'valid@email.com' };

    userRepository.findBy.mockReturnValueOnce([existsUser, otherUser]);
    hasherCryptography.hash.mockReturnValueOnce(Promise.resolve('hashed_password'));
    userRepository.update.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel).catch();

    expect(sutResult).toStrictEqual(responseModel);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        id: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'uuidV4' }),
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
        password: [
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'password' }),
          validatorService.rules.length({ minLength: 6, maxLength: 20 }),
        ],
        roles: [
          validatorService.rules.array({
            rules: [
              validatorService.rules.string(),
              validatorService.rules.in({ values: ['admin', 'moderator'] }),
            ],
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: { users: [] },
    });
    expect(userRepository.findBy).toBeCalledWith([
      { id: sanitizedRequestModel.id },
      { email: sanitizedRequestModel.email },
    ]);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        id: [
          validatorService.rules.exists({
            dataEntity: 'users',
            props: [{ modelKey: 'id', dataKey: 'id' }],
          }),
        ],
        name: [],
        email: [
          validatorService.rules.unique({
            dataEntity: 'users',
            ignoreProps: [{ modelKey: 'id', dataKey: 'id' }],
            props: [{ modelKey: 'email', dataKey: 'email' }],
          }),
        ],
        password: [],
        roles: [],
      },
      model: sanitizedRequestModel,
      data: { users: [existsUser, otherUser] },
    });
    expect(hasherCryptography.hash).toBeCalledWith(sanitizedRequestModel.password);
    expect(userRepository.update).toBeCalledWith(
      { id: sanitizedRequestModel.id },
      { ...sanitizedRequestModel, password: 'hashed_password' },
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
    {
      properties: { email: 'valid@email.com', id: nonExistentId },
      validations: [
        { field: 'id', rule: 'exists', message: 'This value was not found' },
        { field: 'email', rule: 'unique', message: 'This value has already been used' },
      ],
    },
    // password
    {
      properties: { password: 1 },
      validations: [{ field: 'password', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { password: ' InV@L1D n@m3 ' },
      validations: [
        {
          field: 'password',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: password',
        },
      ],
    },
    {
      properties: { password: 'L0we!' },
      validations: [
        {
          field: 'password',
          rule: 'length',
          message: 'This value length must be beetween 6 and 20',
        },
      ],
    },
    {
      properties: {
        password: 'Biggest.Password.Biggest.Password.Biggest.Password@1',
      },
      validations: [
        {
          field: 'password',
          rule: 'length',
          message: 'This value length must be beetween 6 and 20',
        },
      ],
    },
    // roles
    {
      properties: { roles: 'invalid_array' },
      validations: [{ field: 'roles', rule: 'array', message: 'This value must be an array' }],
    },
    {
      properties: { roles: [1, 2] },
      validations: [
        { field: 'roles.0', rule: 'string', message: 'This value must be a string' },
        { field: 'roles.1', rule: 'string', message: 'This value must be a string' },
      ],
    },
    {
      properties: { roles: ['invalid_role', 'invalid_role'] },
      validations: [
        { field: 'roles.0', rule: 'in', message: 'This value must be in: admin, moderator' },
        { field: 'roles.1', rule: 'in', message: 'This value must be in: admin, moderator' },
      ],
    },
  ])(
    'Should throw ValidationException for every user invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut();

        const requestModel = {
          id: validUuidV4,
          name: 'Any Name',
          email: 'any@email.com',
          password: 'Password@123',
          roles: [],
          ...properties,
        } as UpdateUserUseCase.RequestModel;

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

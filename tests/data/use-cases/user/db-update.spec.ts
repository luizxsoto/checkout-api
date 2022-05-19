import { DbUpdateUserUseCase } from '@/data/use-cases';
import { UserModel } from '@/domain/models';
import { ValidationException } from '@/infra/exceptions';
import { makeUserRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';

function makeSut() {
  const userRepository = makeUserRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbUpdateUserUseCase(userRepository, userRepository, validatorService);

  return { userRepository, validatorService, sut };
}

describe(DbUpdateUserUseCase.name, () => {
  test('Should update user and return correct values', async () => {
    const { userRepository, validatorService, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      name: 'Any Name',
      email: 'any@email.com',
      username: 'any.username',
      password: 'Password@123',
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = { ...requestModel };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = { ...sanitizedRequestModel, updatedAt: new Date() };
    const existsUser = { ...responseModel };
    const otherUser = {
      ...responseModel,
      email: 'valid@email.com',
      username: 'other.username',
    };

    userRepository.findBy.mockReturnValueOnce([existsUser, otherUser]);
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
        username: [
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'username' }),
          validatorService.rules.length({ minLength: 6, maxLength: 20 }),
        ],
        password: [
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'password' }),
          validatorService.rules.length({ minLength: 6, maxLength: 20 }),
        ],
      },
      model: sanitizedRequestModel,
      data: { users: [] },
    });
    expect(userRepository.findBy).toBeCalledWith([
      { id: sanitizedRequestModel.id },
      { email: sanitizedRequestModel.email },
      { username: sanitizedRequestModel.username },
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
        username: [
          validatorService.rules.unique({
            dataEntity: 'users',
            ignoreProps: [{ modelKey: 'id', dataKey: 'id' }],
            props: [{ modelKey: 'username', dataKey: 'username' }],
          }),
        ],
        password: [],
      },
      model: sanitizedRequestModel,
      data: { users: [existsUser, otherUser] },
    });
    expect(userRepository.update).toBeCalledWith(
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
    'Should throw ValidationException for every user invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { userRepository, sut } = makeSut();

        // eslint-disable-next-line prefer-object-spread
        const requestModel: UserModel = Object.assign(
          {
            id: validUuidV4,
            name: 'Any Name',
            email: 'any@email.com',
            username: 'any.username',
            password: 'Password@123',
          },
          properties,
        );
        const responseModel = { ...requestModel, updatedAt: new Date() };

        userRepository.findBy.mockReturnValueOnce([responseModel]);
        userRepository.update.mockReturnValueOnce(responseModel);

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );

  test('Should throw ValidationException if id was not found', async () => {
    const { userRepository, sut } = makeSut();

    const requestModel = {
      id: '00000000-0000-4000-8000-000000000002',
      name: 'Any Name',
      email: 'any@email.com',
      username: 'any.username',
      password: 'Password@123',
    };
    const responseModel = { ...requestModel, updatedAt: new Date() };

    userRepository.findBy.mockReturnValueOnce([
      { ...responseModel, id: validUuidV4, email: 'other@email.com', username: 'other.username' },
    ]);
    userRepository.update.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel).catch((e) => e);

    expect(sutResult).toStrictEqual(
      new ValidationException([
        { field: 'id', rule: 'exists', message: 'This value was not found' },
      ]),
    );
  });

  test('Should throw ValidationException if email is already used', async () => {
    const { userRepository, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      name: 'Any Name',
      email: 'any@email.com',
      username: 'any.username',
      password: 'Password@123',
    };
    const responseModel = { ...requestModel, updatedAt: new Date() };

    userRepository.findBy.mockReturnValueOnce([
      { ...responseModel, email: 'other@email.com' },
      { ...responseModel, id: '00000000-0000-4000-8000-000000000002', username: 'other.username' },
    ]);
    userRepository.update.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel).catch((e) => e);

    expect(sutResult).toStrictEqual(
      new ValidationException([
        { field: 'email', rule: 'unique', message: 'This value has already been used' },
      ]),
    );
  });

  test('Should throw ValidationException if username is already used', async () => {
    const { userRepository, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      name: 'Any Name',
      email: 'any@email.com',
      username: 'any.username',
      password: 'Password@123',
    };
    const responseModel = { ...requestModel, updatedAt: new Date() };

    userRepository.findBy.mockReturnValueOnce([
      { ...responseModel, username: 'other.username' },
      { ...responseModel, id: '00000000-0000-4000-8000-000000000002', email: 'other@email.com' },
    ]);
    userRepository.update.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel).catch((e) => e);

    expect(sutResult).toStrictEqual(
      new ValidationException([
        { field: 'username', rule: 'unique', message: 'This value has already been used' },
      ]),
    );
  });
});

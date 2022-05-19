import { DbCreateUserUseCase } from '@/data/use-cases';
import { ValidationException } from '@/infra/exceptions';
import { makeUserRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

function makeSut() {
  const userRepository = makeUserRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbCreateUserUseCase(userRepository, userRepository, validatorService);

  return { userRepository, validatorService, sut };
}

describe(DbCreateUserUseCase.name, () => {
  test('Should create user and return correct values', async () => {
    const { userRepository, validatorService, sut } = makeSut();

    const requestModel = {
      name: 'Any Name',
      email: 'any@email.com',
      username: 'any.username',
      password: 'Password@123',
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = { ...requestModel };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = { ...sanitizedRequestModel, id: 'any_id', createdAt: new Date() };
    const otherUser = { ...responseModel, email: 'valid@email.com', username: 'other.username' };

    userRepository.findBy.mockReturnValueOnce([otherUser]);
    userRepository.create.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        name: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'name' }),
          validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'email' }),
          validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        username: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'username' }),
          validatorService.rules.length({ minLength: 6, maxLength: 20 }),
        ],
        password: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'password' }),
          validatorService.rules.length({ minLength: 6, maxLength: 20 }),
        ],
      },
      model: sanitizedRequestModel,
      data: { users: [] },
    });
    expect(userRepository.findBy).toBeCalledWith([
      { email: sanitizedRequestModel.email },
      { username: sanitizedRequestModel.username },
    ]);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        name: [],
        email: [
          validatorService.rules.unique({
            dataEntity: 'users',
            props: [{ modelKey: 'email', dataKey: 'email' }],
          }),
        ],
        username: [
          validatorService.rules.unique({
            dataEntity: 'users',
            props: [{ modelKey: 'username', dataKey: 'username' }],
          }),
        ],
        password: [],
      },
      model: sanitizedRequestModel,
      data: { users: [otherUser] },
    });
    expect(userRepository.create).toBeCalledWith(sanitizedRequestModel);
  });

  describe.each([
    // name
    {
      properties: { name: undefined },
      validations: [{ field: 'name', rule: 'required', message: 'This value is required' }],
    },
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
        name: 'Biggest Name Biggest Name Biggest Name Biggest Name Biggest Name Biggest Name Biggest Name Biggest Name',
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
    // username
    {
      properties: { username: undefined },
      validations: [{ field: 'username', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { username: 1 },
      validations: [{ field: 'username', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { username: ' InV@L1D n@m3 ' },
      validations: [
        {
          field: 'username',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: username',
        },
      ],
    },
    {
      properties: { username: 'lower' },
      validations: [
        {
          field: 'username',
          rule: 'length',
          message: 'This value length must be beetween 6 and 20',
        },
      ],
    },
    {
      properties: {
        username: 'biggest.name.biggest.name.biggest.name',
      },
      validations: [
        {
          field: 'username',
          rule: 'length',
          message: 'This value length must be beetween 6 and 20',
        },
      ],
    },
    {
      properties: { username: 'any.username' },
      validations: [
        { field: 'username', rule: 'unique', message: 'This value has already been used' },
      ],
    },
    // password
    {
      properties: { password: undefined },
      validations: [{ field: 'password', rule: 'required', message: 'This value is required' }],
    },
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
  ])(
    'Should throw ValidationException for every user invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { userRepository, sut } = makeSut();

        // eslint-disable-next-line prefer-object-spread
        const requestModel = Object.assign(
          {
            name: 'Any Name',
            email: 'any@email.com',
            username: 'other.username',
            password: 'Password@123',
          },
          properties,
        );
        const responseModel = { ...(requestModel as any), id: 'any_id', createdAt: new Date() };

        userRepository.create.mockReturnValueOnce(responseModel);

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

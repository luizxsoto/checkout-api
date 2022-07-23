import { DbCreateUserUseCase } from '@/data/use-cases';
import { CreateUserUseCase } from '@/domain/use-cases';
import { ValidationException } from '@/main/exceptions';
import {
  ArrayValidation,
  DistinctValidation,
  InValidation,
  LengthValidation,
  RegexValidation,
  RequiredValidation,
  StringValidation,
  UniqueValidation,
} from '@/validation/validators';
import { makeHasherCryptographyStub } from '@tests/data/stubs/cryptography';
import { makeUserRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidationServiceStub } from '@tests/data/stubs/services';
import { makeUserModelMock } from '@tests/domain/mocks/models';

const existingUser = makeUserModelMock();

function makeSut() {
  const userRepository = makeUserRepositoryStub();
  const validationService = makeValidationServiceStub();
  const hasherCryptography = makeHasherCryptographyStub();
  const sut = new DbCreateUserUseCase(
    userRepository,
    userRepository,
    validationService,
    hasherCryptography,
  );

  return { userRepository, validationService, hasherCryptography, sut };
}

describe(DbCreateUserUseCase.name, () => {
  test('Should create user and return correct values', async () => {
    const { userRepository, validationService, hasherCryptography, sut } = makeSut();

    const requestModel = {
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
      id: 'any_id',
      createdAt: new Date(),
      password: 'hashed_password',
    };
    Reflect.deleteProperty(responseModel, 'password');
    const otherUser = { ...existingUser, email: 'valid@email.com' };

    userRepository.findBy.mockReturnValueOnce([otherUser]);
    hasherCryptography.hash.mockReturnValueOnce(Promise.resolve('hashed_password'));
    userRepository.create.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(validationService.validate).toBeCalledWith({
      schema: {
        name: [
          new RequiredValidation.Validator(),
          new StringValidation.Validator(),
          new RegexValidation.Validator({ pattern: 'name' }),
          new LengthValidation.Validator({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          new RequiredValidation.Validator(),
          new StringValidation.Validator(),
          new RegexValidation.Validator({ pattern: 'email' }),
          new LengthValidation.Validator({ minLength: 6, maxLength: 100 }),
        ],
        password: [
          new RequiredValidation.Validator(),
          new StringValidation.Validator(),
          new RegexValidation.Validator({ pattern: 'password' }),
          new LengthValidation.Validator({ minLength: 6, maxLength: 20 }),
        ],
        roles: [
          new RequiredValidation.Validator(),
          new ArrayValidation.Validator(
            {
              validations: [
                new StringValidation.Validator(),
                new InValidation.Validator({ values: ['admin', 'moderator'] }),
              ],
            },
            validationService,
          ),
          new DistinctValidation.Validator(),
        ],
      },
      model: sanitizedRequestModel,
      data: {},
    });
    expect(userRepository.findBy).toBeCalledWith([{ email: sanitizedRequestModel.email }], true);
    expect(validationService.validate).toBeCalledWith({
      schema: {
        email: [
          new UniqueValidation.Validator({
            dataEntity: 'users',
            props: [{ modelKey: 'email', dataKey: 'email' }],
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: { users: [otherUser] },
    });
    expect(hasherCryptography.hash).toBeCalledWith(sanitizedRequestModel.password);
    expect(userRepository.create).toBeCalledWith({
      ...sanitizedRequestModel,
      password: 'hashed_password',
    });
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
          details: { pattern: '/^([a-zA-Z\\u00C0-\\u00FF]+\\s)*[a-zA-Z\\u00C0-\\u00FF]+$/' },
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
          details: { pattern: '/^[\\w+.]+@\\w+\\.\\w{2,}(?:\\.\\w{2})?$/' },
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
        {
          field: 'email',
          rule: 'unique',
          message: 'This value has already been used',
          details: { findedRegister: existingUser },
        },
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
          details: {
            pattern: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]/',
          },
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
      properties: { roles: undefined },
      validations: [{ field: 'roles', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { roles: 'invalid_array' },
      validations: [{ field: 'roles', rule: 'array', message: 'This value must be an array' }],
    },
    {
      properties: { roles: [1] },
      validations: [{ field: 'roles.0', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { roles: ['invalid_role'] },
      validations: [
        { field: 'roles.0', rule: 'in', message: 'This value must be in: admin, moderator' },
      ],
    },
    {
      properties: { roles: ['admin', 'admin'] },
      validations: [
        { field: 'roles', rule: 'distinct', message: 'This value cannot have duplicate items' },
      ],
    },
  ])(
    'Should throw ValidationException for every user invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { userRepository, sut } = makeSut();

        const requestModel = {
          name: 'Any Name',
          email: 'any@email.com',
          password: 'Password@123',
          roles: [],
          ...properties,
        } as CreateUserUseCase.RequestModel;
        const responseModel = { ...requestModel, id: 'any_id', createdAt: new Date() };

        userRepository.findBy.mockReturnValueOnce([existingUser]);
        userRepository.create.mockReturnValueOnce(responseModel);

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

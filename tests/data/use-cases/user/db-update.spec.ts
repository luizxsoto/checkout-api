import { DbUpdateUserUseCase } from '@/data/use-cases';
import { UpdateUserUseCase } from '@/domain/use-cases';
import { ValidationException } from '@/main/exceptions';
import {
  ArrayValidation,
  DistinctValidation,
  ExistsValidation,
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

const validUuidV4 = '00000000-0000-4000-8000-000000000001';
const nonExistentId = '00000000-0000-4000-8000-000000000002';
const existingUser = makeUserModelMock();

function makeSut() {
  const userRepository = makeUserRepositoryStub();
  const validationService = makeValidationServiceStub();
  const hasherCryptography = makeHasherCryptographyStub();
  const sut = new DbUpdateUserUseCase(
    userRepository,
    userRepository,
    validationService,
    hasherCryptography,
  );

  return { userRepository, validationService, hasherCryptography, sut };
}

describe(DbUpdateUserUseCase.name, () => {
  test('Should update user and return correct values', async () => {
    const { userRepository, validationService, hasherCryptography, sut } = makeSut();

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
    Reflect.deleteProperty(responseModel, 'password');
    const existsUser = { ...responseModel };
    const otherUser = { ...existingUser, email: 'valid@email.com' };

    userRepository.findBy.mockReturnValueOnce([existsUser, otherUser]);
    hasherCryptography.hash.mockReturnValueOnce(Promise.resolve('hashed_password'));
    userRepository.update.mockReturnValueOnce([responseModel]);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(validationService.validate).toBeCalledWith({
      schema: {
        id: [
          new RequiredValidation.Validator(),
          new StringValidation.Validator(),
          new RegexValidation.Validator({ pattern: 'uuidV4' }),
        ],
        name: [
          new StringValidation.Validator(),
          new RegexValidation.Validator({ pattern: 'name' }),
          new LengthValidation.Validator({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          new StringValidation.Validator(),
          new RegexValidation.Validator({ pattern: 'email' }),
          new LengthValidation.Validator({ minLength: 6, maxLength: 100 }),
        ],
        password: [
          new StringValidation.Validator(),
          new RegexValidation.Validator({ pattern: 'password' }),
          new LengthValidation.Validator({ minLength: 6, maxLength: 20 }),
        ],
        roles: [
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
    expect(userRepository.findBy).toBeCalledWith(
      [{ id: sanitizedRequestModel.id }, { email: sanitizedRequestModel.email }],
      true,
    );
    expect(validationService.validate).toBeCalledWith({
      schema: {
        id: [
          new ExistsValidation.Validator({
            dataEntity: 'users',
            props: [{ modelKey: 'id', dataKey: 'id' }],
          }),
        ],
        email: [
          new UniqueValidation.Validator({
            dataEntity: 'users',
            ignoreProps: [{ modelKey: 'id', dataKey: 'id' }],
            props: [{ modelKey: 'email', dataKey: 'email' }],
          }),
        ],
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
          details: {
            pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i',
          },
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
      properties: { email: 'valid@email.com', id: nonExistentId },
      validations: [
        { field: 'id', rule: 'exists', message: 'This value was not found' },
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
          id: validUuidV4,
          name: 'Any Name',
          email: 'any@email.com',
          password: 'Password@123',
          roles: [],
          ...properties,
        } as UpdateUserUseCase.RequestModel;

        userRepository.findBy.mockReturnValueOnce([existingUser]);
        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

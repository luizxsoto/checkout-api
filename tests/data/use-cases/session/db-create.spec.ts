import { DbCreateSessionUseCase } from '@/data/use-cases';
import { CreateSessionUseCase } from '@/domain/use-cases';
import { ValidationException } from '@/main/exceptions';
import {
  makeEncrypterCryptographyStub,
  makeHashCompareCryptographyStub,
} from '@tests/data/stubs/cryptography';
import { makeUserRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

function makeSut() {
  const userRepository = makeUserRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const hashCompareCryptography = makeHashCompareCryptographyStub();
  const encrypterCryptography = makeEncrypterCryptographyStub();
  const sut = new DbCreateSessionUseCase(
    userRepository,
    hashCompareCryptography,
    encrypterCryptography,
    validatorService,
  );

  return { userRepository, validatorService, hashCompareCryptography, encrypterCryptography, sut };
}

describe(DbCreateSessionUseCase.name, () => {
  test('Should create session and return correct values', async () => {
    const {
      userRepository,
      validatorService,
      hashCompareCryptography,
      encrypterCryptography,
      sut,
    } = makeSut();

    const requestModel = {
      email: 'any@email.com',
      password: 'Password@123',
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = { ...requestModel };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = {
      ...sanitizedRequestModel,
      id: 'any_id',
      roles: ['any_role'],
      createdAt: new Date(),
      password: 'hashed_password',
      createUserId: '00000000-0000-4000-8000-000000000001',
      bearerToken: 'any_bearerToken',
    };
    Reflect.deleteProperty(responseModel, 'password');

    userRepository.findBy.mockReturnValueOnce([responseModel]);
    hashCompareCryptography.compare.mockReturnValueOnce(Promise.resolve(true));
    encrypterCryptography.encrypt.mockReturnValueOnce(Promise.resolve('any_bearerToken'));

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        email: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'email' }),
          validatorService.rules.length({ minLength: 6, maxLength: 100 }),
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
    expect(userRepository.findBy).toBeCalledWith([{ email: sanitizedRequestModel.email }]);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        email: [
          validatorService.rules.exists({
            dataEntity: 'users',
            props: [{ modelKey: 'email', dataKey: 'email' }],
          }),
        ],
        password: [],
      },
      model: sanitizedRequestModel,
      data: { users: [responseModel] },
    });
    expect(hashCompareCryptography.compare).toBeCalledWith(
      sanitizedRequestModel.password,
      responseModel.password,
    );
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        email: [],
        password: [
          validatorService.rules.custom({
            validation: expect.any(Function),
            rule: 'password',
            message: 'Wrong password',
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: { users: [] },
    });
    expect(encrypterCryptography.encrypt).toBeCalledWith({
      userId: responseModel.id,
      roles: responseModel.roles,
    });
  });

  describe.each([
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
      properties: { email: 'any@email.com' },
      validations: [{ field: 'email', rule: 'exists', message: 'This value was not found' }],
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
      properties: { password: 'Biggest.Password.Biggest.Password.Biggest.Password@1' },
      validations: [
        {
          field: 'password',
          rule: 'length',
          message: 'This value length must be beetween 6 and 20',
        },
      ],
    },
    {
      properties: { password: '0ther@Password' },
      validations: [{ field: 'password', rule: 'password', message: 'Wrong password' }],
    },
  ])(
    'Should throw ValidationException for every session invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut();

        const requestModel = {
          email: 'valid@email.com',
          password: 'Password@123',
          ...properties,
        } as CreateSessionUseCase.RequestModel;

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});

import { DbCreateSessionUseCase } from '@/data/use-cases';
import { makeEncrypterCryptographyStub } from '@tests/data/stubs/cryptography';
import { makeUserRepositoryStub } from '@tests/data/stubs/repositories';
import { makeCreateSessionValidationStub } from '@tests/data/stubs/validations';

function makeSut() {
  const userRepository = makeUserRepositoryStub();
  const encrypterCryptography = makeEncrypterCryptographyStub();
  const createSessionValidation = makeCreateSessionValidationStub();
  const sut = new DbCreateSessionUseCase(
    userRepository,
    encrypterCryptography,
    createSessionValidation.firstValidation,
  );

  return { userRepository, encrypterCryptography, createSessionValidation, sut };
}

describe(DbCreateSessionUseCase.name, () => {
  test('Should create session and return correct values', async () => {
    const { userRepository, encrypterCryptography, createSessionValidation, sut } = makeSut();

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
      bearerToken: 'any_bearerToken',
    };
    Reflect.deleteProperty(responseModel, 'password');

    userRepository.findBy.mockReturnValueOnce([responseModel]);
    encrypterCryptography.encrypt.mockReturnValueOnce(Promise.resolve('any_bearerToken'));

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(createSessionValidation.firstValidation).toBeCalledWith(sanitizedRequestModel);
    expect(userRepository.findBy).toBeCalledWith([{ email: sanitizedRequestModel.email }]);
    expect(createSessionValidation.secondValidation).toBeCalledWith({ users: [responseModel] });
    expect(createSessionValidation.thirdValidation).toBeCalledWith(responseModel);
    expect(encrypterCryptography.encrypt).toBeCalledWith({
      userId: responseModel.id,
      roles: responseModel.roles,
    });
  });

  test('Should throws if firstValidation throws', async () => {
    const { createSessionValidation, sut } = makeSut();

    const requestModel = {
      email: 'any@email.com',
      password: 'Password@123',
      anyWrongProp: 'anyValue',
    };
    const error = new Error('firstValidation Error');

    createSessionValidation.firstValidation.mockReturnValueOnce(Promise.reject(error));

    const sutResult = sut.execute(requestModel);

    await expect(sutResult).rejects.toStrictEqual(error);
  });

  test('Should throws if secondValidation throws', async () => {
    const { createSessionValidation, sut } = makeSut();

    const requestModel = {
      email: 'any@email.com',
      password: 'Password@123',
      anyWrongProp: 'anyValue',
    };
    const error = new Error('secondValidation Error');

    createSessionValidation.secondValidation.mockReturnValueOnce(Promise.reject(error));

    const sutResult = sut.execute(requestModel);

    await expect(sutResult).rejects.toStrictEqual(error);
  });

  test('Should throws if thirdValidation throws', async () => {
    const { createSessionValidation, sut } = makeSut();

    const requestModel = {
      email: 'any@email.com',
      password: 'Password@123',
      anyWrongProp: 'anyValue',
    };
    const error = new Error('thirdValidation Error');

    createSessionValidation.thirdValidation.mockReturnValueOnce(Promise.reject(error));

    const sutResult = sut.execute(requestModel);

    await expect(sutResult).rejects.toStrictEqual(error);
  });
});

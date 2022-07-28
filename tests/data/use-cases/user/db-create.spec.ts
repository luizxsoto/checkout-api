import { DbCreateUserUseCase } from '@/data/use-cases';
import { makeHasherCryptographyStub } from '@tests/data/stubs/cryptography';
import { makeUserRepositoryStub } from '@tests/data/stubs/repositories';
import { makeCreateUserValidationStub } from '@tests/data/stubs/validations';
import { makeUserModelMock } from '@tests/domain/mocks/models';

const existingUser = makeUserModelMock();

function makeSut() {
  const userRepository = makeUserRepositoryStub();
  const createUserValidation = makeCreateUserValidationStub();
  const hasherCryptography = makeHasherCryptographyStub();
  const sut = new DbCreateUserUseCase(
    userRepository,
    userRepository,
    createUserValidation.firstValidation,
    hasherCryptography,
  );

  return { userRepository, createUserValidation, hasherCryptography, sut };
}

describe(DbCreateUserUseCase.name, () => {
  test('Should create user and return correct values', async () => {
    const { userRepository, createUserValidation, hasherCryptography, sut } = makeSut();

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
    userRepository.create.mockReturnValueOnce([responseModel]);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(createUserValidation.firstValidation).toBeCalledWith(sanitizedRequestModel);
    expect(userRepository.findBy).toBeCalledWith([{ email: sanitizedRequestModel.email }], true);
    expect(createUserValidation.secondValidation).toBeCalledWith({ users: [otherUser] });
    expect(hasherCryptography.hash).toBeCalledWith(sanitizedRequestModel.password);
    expect(userRepository.create).toBeCalledWith([
      { ...sanitizedRequestModel, password: 'hashed_password' },
    ]);
  });

  test('Should throws if firstValidation throws', async () => {
    const { createUserValidation, sut } = makeSut();

    const requestModel = {
      name: 'Any Name',
      email: 'any@email.com',
      password: 'Password@123',
      roles: [],
      anyWrongProp: 'anyValue',
    };
    const error = new Error('firstValidation Error');

    createUserValidation.firstValidation.mockReturnValueOnce(Promise.reject(error));

    const sutResult = sut.execute(requestModel);

    await expect(sutResult).rejects.toStrictEqual(error);
  });

  test('Should throws if secondValidation throws', async () => {
    const { createUserValidation, sut } = makeSut();

    const requestModel = {
      name: 'Any Name',
      email: 'any@email.com',
      password: 'Password@123',
      roles: [],
      anyWrongProp: 'anyValue',
    };
    const error = new Error('secondValidation Error');

    createUserValidation.secondValidation.mockReturnValueOnce(Promise.reject(error));

    const sutResult = sut.execute(requestModel);

    await expect(sutResult).rejects.toStrictEqual(error);
  });
});

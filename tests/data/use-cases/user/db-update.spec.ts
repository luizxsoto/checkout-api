import { DbUpdateUserUseCase } from '@/data/use-cases';
import { makeHasherCryptographyStub } from '@tests/data/stubs/cryptography';
import { makeUserRepositoryStub } from '@tests/data/stubs/repositories';
import { makeUpdateUserValidationStub } from '@tests/data/stubs/validations';
import { makeUserModelMock } from '@tests/domain/mocks/models';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';
const existingUser = makeUserModelMock();

function makeSut() {
  const userRepository = makeUserRepositoryStub();
  const updateUserValidation = makeUpdateUserValidationStub();
  const hasherCryptography = makeHasherCryptographyStub();
  const sut = new DbUpdateUserUseCase(
    userRepository,
    userRepository,
    updateUserValidation.firstValidation,
    hasherCryptography,
  );

  return { userRepository, updateUserValidation, hasherCryptography, sut };
}

describe(DbUpdateUserUseCase.name, () => {
  test('Should update user and return correct values', async () => {
    const { userRepository, updateUserValidation, hasherCryptography, sut } = makeSut();

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
    expect(updateUserValidation.firstValidation).toBeCalledWith(sanitizedRequestModel);
    expect(userRepository.findBy).toBeCalledWith(
      [{ id: sanitizedRequestModel.id }, { email: sanitizedRequestModel.email }],
      true,
    );
    expect(updateUserValidation.secondValidation).toBeCalledWith({
      users: [existsUser, otherUser],
    });
    expect(hasherCryptography.hash).toBeCalledWith(sanitizedRequestModel.password);
    expect(userRepository.update).toBeCalledWith(
      { id: sanitizedRequestModel.id },
      { ...sanitizedRequestModel, password: 'hashed_password' },
    );
  });

  test('Should throws if firstValidation throws', async () => {
    const { updateUserValidation, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      name: 'Any Name',
      email: 'any@email.com',
      password: 'Password@123',
      roles: [],
      anyWrongProp: 'anyValue',
    };
    const error = new Error('firstValidation Error');

    updateUserValidation.firstValidation.mockReturnValueOnce(Promise.reject(error));

    const sutResult = sut.execute(requestModel);

    await expect(sutResult).rejects.toStrictEqual(error);
  });

  test('Should throws if secondValidation throws', async () => {
    const { updateUserValidation, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      name: 'Any Name',
      email: 'any@email.com',
      password: 'Password@123',
      roles: [],
      anyWrongProp: 'anyValue',
    };
    const error = new Error('secondValidation Error');

    updateUserValidation.secondValidation.mockReturnValueOnce(Promise.reject(error));

    const sutResult = sut.execute(requestModel);

    await expect(sutResult).rejects.toStrictEqual(error);
  });
});

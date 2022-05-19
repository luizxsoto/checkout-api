import { CreateUserController } from '@/presentation/controllers';
import { makeUserModelMock } from '@tests/domain/mocks/models';
import { makeCreateUserUseCaseStub } from '@tests/presentation/stubs/use-cases';

const userMock = makeUserModelMock();

jest.mock('@/presentation/helpers/http-helper', () => ({
  created: jest.fn(() => ({ statusCode: 201, body: userMock })),
}));

function makeSut() {
  const createUserUseCase = makeCreateUserUseCaseStub();
  const sut = new CreateUserController(createUserUseCase);

  return { createUserUseCase, sut };
}

describe(CreateUserController.name, () => {
  test('Should create user and return correct values', async () => {
    const { createUserUseCase, sut } = makeSut();

    createUserUseCase.execute.mockReturnValueOnce(Promise.resolve(userMock));

    const sutResult = await sut.handle(userMock);

    expect(sutResult).toStrictEqual({ statusCode: 201, body: userMock });
    expect(createUserUseCase.execute).toBeCalledWith(userMock);
  });
});

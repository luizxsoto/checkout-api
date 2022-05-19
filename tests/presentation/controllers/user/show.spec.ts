import { ShowUserController } from '@/presentation/controllers';
import { makeUserModelMock } from '@tests/domain/mocks/models';
import { makeShowUserUseCaseStub } from '@tests/presentation/stubs/use-cases';

const userMock = makeUserModelMock();

jest.mock('@/presentation/helpers/http-helper', () => ({
  ok: jest.fn(() => ({ statusCode: 200, body: userMock })),
}));

function makeSut() {
  const showUserUseCase = makeShowUserUseCaseStub();
  const sut = new ShowUserController(showUserUseCase);

  return { showUserUseCase, sut };
}

describe(ShowUserController.name, () => {
  test('Should show user and return correct values', async () => {
    const { showUserUseCase, sut } = makeSut();

    showUserUseCase.execute.mockReturnValueOnce(Promise.resolve(userMock));

    const sutResult = await sut.handle(userMock);

    expect(sutResult).toStrictEqual({ statusCode: 200, body: userMock });
    expect(showUserUseCase.execute).toBeCalledWith(userMock);
  });
});

import { UpdateUserController } from '@/presentation/controllers';
import { makeUserModelMock } from '@tests/domain/mocks/models';
import { makeUpdateUserUseCaseStub } from '@tests/presentation/stubs/use-cases';

const userMock = makeUserModelMock();

jest.mock('@/presentation/helpers/http-helper', () => ({
  ok: jest.fn(() => ({ statusCode: 200, body: userMock })),
}));

function makeSut() {
  const updateUserUseCase = makeUpdateUserUseCaseStub();
  const sut = new UpdateUserController(updateUserUseCase);

  return { updateUserUseCase, sut };
}

describe(UpdateUserController.name, () => {
  test('Should update user and return correct values', async () => {
    const { updateUserUseCase, sut } = makeSut();

    updateUserUseCase.execute.mockReturnValueOnce(Promise.resolve(userMock));

    const sutResult = await sut.handle(userMock);

    expect(sutResult).toStrictEqual({ statusCode: 200, body: userMock });
    expect(updateUserUseCase.execute).toBeCalledWith(userMock);
  });
});

import { ListUserController } from '@/presentation/controllers';
import { makeUserModelMock } from '@tests/domain/mocks/models';
import { makeListUserUseCaseStub } from '@tests/presentation/stubs/use-cases';

const userMock = makeUserModelMock();

jest.mock('@/presentation/helpers/http-helper', () => ({
  ok: jest.fn(() => ({ statusCode: 200, body: [userMock] })),
}));

function makeSut() {
  const listUserUseCase = makeListUserUseCaseStub();
  const sut = new ListUserController(listUserUseCase);

  return { listUserUseCase, sut };
}

describe(ListUserController.name, () => {
  test('Should list user and return correct values', async () => {
    const { listUserUseCase, sut } = makeSut();

    listUserUseCase.execute.mockReturnValueOnce(Promise.resolve([userMock]));

    const sutResult = await sut.handle({});

    expect(sutResult).toStrictEqual({ statusCode: 200, body: [userMock] });
    expect(listUserUseCase.execute).toBeCalledWith({});
  });
});

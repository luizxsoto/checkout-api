import { CreateSessionController } from '@/presentation/controllers';
import { makeUserModelMock } from '@tests/domain/mocks/models';
import { makeCreateSessionUseCaseStub } from '@tests/presentation/stubs/use-cases';

const sessionMock = { ...makeUserModelMock(), accessToken: 'any_accessToken' };

jest.mock('@/presentation/helpers/http-helper', () => ({
  created: jest.fn(() => ({ statusCode: 201, body: sessionMock })),
}));

function makeSut() {
  const createSessionUseCase = makeCreateSessionUseCaseStub();
  const sut = new CreateSessionController(createSessionUseCase);

  return { createSessionUseCase, sut };
}

describe(CreateSessionController.name, () => {
  test('Should create session and return correct values', async () => {
    const { createSessionUseCase, sut } = makeSut();

    createSessionUseCase.execute.mockReturnValueOnce(Promise.resolve(sessionMock));

    const sutResult = await sut.handle(sessionMock);

    expect(sutResult).toStrictEqual({ statusCode: 201, body: sessionMock });
    expect(createSessionUseCase.execute).toBeCalledWith(sessionMock);
  });
});

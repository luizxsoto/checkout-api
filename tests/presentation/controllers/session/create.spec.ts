import { makeUserModelMock } from '@tests/domain/mocks/models'
import { makeCreateSessionUseCaseStub } from '@tests/presentation/stubs/use-cases'

import { CreateSessionController } from '@/presentation/controllers'

const sessionMock = { ...makeUserModelMock(), bearerToken: 'any_bearerToken' }

function makeSut() {
  const createSessionUseCase = makeCreateSessionUseCaseStub()
  const sut = new CreateSessionController(createSessionUseCase)

  return { createSessionUseCase, sut }
}

describe(CreateSessionController.name, () => {
  test('Should create session and return correct values', async () => {
    const { createSessionUseCase, sut } = makeSut()

    createSessionUseCase.execute.mockReturnValueOnce(Promise.resolve(sessionMock))

    const sutResult = await sut.handle(sessionMock)

    expect(sutResult).toStrictEqual({ statusCode: 201, body: sessionMock })
    expect(createSessionUseCase.execute).toBeCalledWith(sessionMock)
  })
})

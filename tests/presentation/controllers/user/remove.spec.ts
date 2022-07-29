import { makeUserModelMock } from '@tests/domain/mocks/models'
import { makeRemoveUserUseCaseStub } from '@tests/presentation/stubs/use-cases'

import { RemoveUserController } from '@/presentation/controllers'

const userMock = makeUserModelMock()

function makeSut() {
  const removeUserUseCase = makeRemoveUserUseCaseStub()
  const sut = new RemoveUserController(removeUserUseCase)

  return { removeUserUseCase, sut }
}

describe(RemoveUserController.name, () => {
  test('Should remove user and return correct values', async () => {
    const { removeUserUseCase, sut } = makeSut()

    removeUserUseCase.execute.mockReturnValueOnce(Promise.resolve(userMock))

    const sutResult = await sut.handle(userMock)

    expect(sutResult).toStrictEqual({ statusCode: 200, body: userMock })
    expect(removeUserUseCase.execute).toBeCalledWith(userMock)
  })
})

import { makeUserModelMock } from '@tests/domain/mocks/models'
import { makeUpdateUserUseCaseStub } from '@tests/presentation/stubs/use-cases'

import { UpdateUserController } from '@/presentation/controllers'

const userMock = makeUserModelMock()

function makeSut() {
  const updateUserUseCase = makeUpdateUserUseCaseStub()
  const sut = new UpdateUserController(updateUserUseCase)

  return { updateUserUseCase, sut }
}

describe(UpdateUserController.name, () => {
  test('Should update user and return correct values', async () => {
    const { updateUserUseCase, sut } = makeSut()

    updateUserUseCase.execute.mockReturnValueOnce(Promise.resolve(userMock))

    const sutResult = await sut.handle(userMock)

    expect(sutResult).toStrictEqual({ statusCode: 200, body: userMock })
    expect(updateUserUseCase.execute).toBeCalledWith(userMock)
  })
})

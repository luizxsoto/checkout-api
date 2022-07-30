import { makeUserModelMock } from '@tests/domain/mocks/models'
import { makeListUserUseCaseStub } from '@tests/presentation/stubs/use-cases'

import { ListUserController } from '@/presentation/controllers'

const userMock = makeUserModelMock()

function makeSut() {
  const listUserUseCase = makeListUserUseCaseStub()
  const sut = new ListUserController(listUserUseCase)

  return { listUserUseCase, sut }
}

describe(ListUserController.name, () => {
  test('Should list user and return correct values', async () => {
    const { listUserUseCase, sut } = makeSut()

    const expectedResult = {
      page: 1,
      perPage: 20,
      lastPage: 1,
      total: 1,
      registers: [userMock]
    }
    listUserUseCase.execute.mockReturnValueOnce(Promise.resolve(expectedResult))

    const sutResult = await sut.handle({})

    expect(sutResult).toStrictEqual({ statusCode: 200, body: expectedResult })
    expect(listUserUseCase.execute).toBeCalledWith({})
  })
})

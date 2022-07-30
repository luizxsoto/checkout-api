import { makeOrderModelMock } from '@tests/domain/mocks/models'
import { makeListOrderUseCaseStub } from '@tests/presentation/stubs/use-cases'

import { ListOrderController } from '@/presentation/controllers'

const orderMock = makeOrderModelMock()

function makeSut() {
  const listOrderUseCase = makeListOrderUseCaseStub()
  const sut = new ListOrderController(listOrderUseCase)

  return { listOrderUseCase, sut }
}

describe(ListOrderController.name, () => {
  test('Should list order and return correct values', async () => {
    const { listOrderUseCase, sut } = makeSut()

    const expectedResult = {
      page: 1,
      perPage: 20,
      lastPage: 1,
      total: 1,
      registers: [orderMock]
    }
    listOrderUseCase.execute.mockReturnValueOnce(Promise.resolve(expectedResult))

    const sutResult = await sut.handle({})

    expect(sutResult).toStrictEqual({ statusCode: 200, body: expectedResult })
    expect(listOrderUseCase.execute).toBeCalledWith({})
  })
})

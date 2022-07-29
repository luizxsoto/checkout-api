import { makeProductModelMock } from '@tests/domain/mocks/models'
import { makeListProductUseCaseStub } from '@tests/presentation/stubs/use-cases'

import { ListProductController } from '@/presentation/controllers'

const productMock = makeProductModelMock()

function makeSut() {
  const listProductUseCase = makeListProductUseCaseStub()
  const sut = new ListProductController(listProductUseCase)

  return { listProductUseCase, sut }
}

describe(ListProductController.name, () => {
  test('Should list product and return correct values', async () => {
    const { listProductUseCase, sut } = makeSut()

    listProductUseCase.execute.mockReturnValueOnce(Promise.resolve([productMock]))

    const sutResult = await sut.handle({})

    expect(sutResult).toStrictEqual({ statusCode: 200, body: [productMock] })
    expect(listProductUseCase.execute).toBeCalledWith({})
  })
})

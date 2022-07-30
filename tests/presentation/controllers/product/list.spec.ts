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

    const expectedResult = {
      page: 1,
      perPage: 20,
      lastPage: 1,
      total: 1,
      registers: [productMock]
    }
    listProductUseCase.execute.mockReturnValueOnce(Promise.resolve(expectedResult))

    const sutResult = await sut.handle({})

    expect(sutResult).toStrictEqual({ statusCode: 200, body: expectedResult })
    expect(listProductUseCase.execute).toBeCalledWith({})
  })
})

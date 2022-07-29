import { makeProductModelMock } from '@tests/domain/mocks/models'
import { makeShowProductUseCaseStub } from '@tests/presentation/stubs/use-cases'

import { ShowProductController } from '@/presentation/controllers'

const productMock = makeProductModelMock()

function makeSut() {
  const showProductUseCase = makeShowProductUseCaseStub()
  const sut = new ShowProductController(showProductUseCase)

  return { showProductUseCase, sut }
}

describe(ShowProductController.name, () => {
  test('Should show product and return correct values', async () => {
    const { showProductUseCase, sut } = makeSut()

    showProductUseCase.execute.mockReturnValueOnce(Promise.resolve(productMock))

    const sutResult = await sut.handle(productMock)

    expect(sutResult).toStrictEqual({ statusCode: 200, body: productMock })
    expect(showProductUseCase.execute).toBeCalledWith(productMock)
  })
})

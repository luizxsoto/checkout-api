import { makeProductRepositoryStub } from '@tests/data/stubs/repositories'
import { makeListProductValidationStub } from '@tests/data/stubs/validations'

import { DbListProductUseCase } from '@/data/use-cases'

function makeSut() {
  const productRepository = makeProductRepositoryStub()
  const listProductValidation = makeListProductValidationStub()
  const sut = new DbListProductUseCase(productRepository, listProductValidation.firstValidation)

  return { productRepository, listProductValidation, sut }
}

describe(DbListProductUseCase.name, () => {
  test('Should list product and return correct values', async () => {
    const { productRepository, listProductValidation, sut } = makeSut()

    const requestModel = {
      page: 1,
      perPage: 20,
      orderBy: 'name' as const,
      order: 'asc' as const,
      filters: '[]',
      anyWrongProp: 'anyValue'
    }
    const sanitizedRequestModel = { ...requestModel }
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp')
    const responseModel = { ...sanitizedRequestModel }
    Reflect.deleteProperty(responseModel, 'page')
    Reflect.deleteProperty(responseModel, 'perPage')
    Reflect.deleteProperty(responseModel, 'orderBy')
    Reflect.deleteProperty(responseModel, 'order')
    Reflect.deleteProperty(responseModel, 'filters')
    const existsProduct = { ...responseModel }

    productRepository.list.mockReturnValueOnce([existsProduct])

    const sutResult = await sut.execute(requestModel)

    expect(sutResult).toStrictEqual([responseModel])
    expect(listProductValidation.firstValidation).toBeCalledWith(sanitizedRequestModel)
    expect(productRepository.list).toBeCalledWith(sanitizedRequestModel)
  })

  test('Should throws if firstValidation throws', async () => {
    const { listProductValidation, sut } = makeSut()

    const requestModel = {
      page: 1,
      perPage: 20,
      orderBy: 'name' as const,
      order: 'asc' as const,
      filters: '[]',
      anyWrongProp: 'anyValue'
    }
    const error = new Error('firstValidation Error')

    listProductValidation.firstValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })
})

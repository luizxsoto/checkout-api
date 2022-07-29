import { makeProductRepositoryStub } from '@tests/data/stubs/repositories'
import { makeRemoveProductValidationStub } from '@tests/data/stubs/validations'

import { DbRemoveProductUseCase } from '@/data/use-cases'

const validUuidV4 = '00000000-0000-4000-8000-000000000001'

function makeSut() {
  const productRepository = makeProductRepositoryStub()
  const removeProductValidation = makeRemoveProductValidationStub()
  const sut = new DbRemoveProductUseCase(
    productRepository,
    productRepository,
    removeProductValidation.firstValidation
  )

  return { productRepository, removeProductValidation, sut }
}

describe(DbRemoveProductUseCase.name, () => {
  test('Should remove product and return correct values', async () => {
    const { productRepository, removeProductValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue',
    }
    const sanitizedRequestModel = {
      ...requestModel,
    }
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp')
    const responseModel = { ...sanitizedRequestModel, deletedAt: new Date() }
    const existsProduct = { ...responseModel }

    productRepository.findBy.mockReturnValueOnce([existsProduct])
    productRepository.remove.mockReturnValueOnce([responseModel])

    const sutResult = await sut.execute(requestModel)

    expect(sutResult).toStrictEqual(responseModel)
    expect(removeProductValidation.firstValidation).toBeCalledWith(sanitizedRequestModel)
    expect(productRepository.findBy).toBeCalledWith([sanitizedRequestModel])
    expect(removeProductValidation.secondValidation).toBeCalledWith({ products: [existsProduct] })
    expect(productRepository.remove).toBeCalledWith(sanitizedRequestModel)
  })

  test('Should throws if firstValidation throws', async () => {
    const { removeProductValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue',
    }
    const error = new Error('firstValidation Error')

    removeProductValidation.firstValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })

  test('Should throws if secondValidation throws', async () => {
    const { removeProductValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      anyWrongProp: 'anyValue',
    }
    const error = new Error('secondValidation Error')

    removeProductValidation.secondValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })
})

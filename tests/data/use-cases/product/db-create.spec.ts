import { makeProductRepositoryStub } from '@tests/data/stubs/repositories'
import { makeCreateProductValidationStub } from '@tests/data/stubs/validations'

import { DbCreateProductUseCase } from '@/data/use-cases'
import { ProductModel } from '@/domain/models'

function makeSut() {
  const productRepository = makeProductRepositoryStub()
  const createProductValidation = makeCreateProductValidationStub()
  const sut = new DbCreateProductUseCase(productRepository, createProductValidation.firstValidation)

  return { productRepository, createProductValidation, sut }
}

describe(DbCreateProductUseCase.name, () => {
  test('Should create product and return correct values', async () => {
    const { productRepository, createProductValidation, sut } = makeSut()

    const requestModel = {
      name: 'Any Name',
      category: 'others' as ProductModel['category'],
      image: 'any-image.com',
      price: 1000,
      anyWrongProp: 'anyValue',
    }
    const sanitizedRequestModel = {
      ...requestModel,
    }
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp')
    const responseModel = { ...sanitizedRequestModel, id: 'any_id', createdAt: new Date() }

    productRepository.create.mockReturnValueOnce([responseModel])

    const sutResult = await sut.execute(requestModel)

    expect(sutResult).toStrictEqual(responseModel)
    expect(createProductValidation.firstValidation).toBeCalledWith(sanitizedRequestModel)
    expect(productRepository.create).toBeCalledWith([sanitizedRequestModel])
  })

  test('Should throws if firstValidation throws', async () => {
    const { createProductValidation, sut } = makeSut()

    const requestModel = {
      name: 'Any Name',
      category: 'others' as ProductModel['category'],
      image: 'any-image.com',
      price: 1000,
      anyWrongProp: 'anyValue',
    }
    const error = new Error('firstValidation Error')

    createProductValidation.firstValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })
})

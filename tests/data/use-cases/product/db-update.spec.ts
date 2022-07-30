import { makeProductRepositoryStub } from '@tests/data/stubs/repositories'
import { makeUpdateProductValidationStub } from '@tests/data/stubs/validations'

import { DbUpdateProductUseCase } from '@/data/use-cases'
import { ProductModel } from '@/domain/models'

const validUuidV4 = '00000000-0000-4000-8000-000000000001'

function makeSut() {
  const productRepository = makeProductRepositoryStub()
  const updateProductValidation = makeUpdateProductValidationStub()
  const sut = new DbUpdateProductUseCase(
    productRepository,
    productRepository,
    updateProductValidation.firstValidation
  )

  return { productRepository, updateProductValidation, sut }
}

describe(DbUpdateProductUseCase.name, () => {
  test('Should update product and return correct values', async () => {
    const { productRepository, updateProductValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      name: 'Any Name',
      category: 'others' as ProductModel['category'],
      image: 'any-image.com',
      price: 1000,
      anyWrongProp: 'anyValue'
    }
    const sanitizedRequestModel = {
      ...requestModel
    }
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp')
    const responseModel = { ...sanitizedRequestModel, updatedAt: new Date() }
    const existsProduct = { ...responseModel }

    productRepository.findBy.mockReturnValueOnce([existsProduct])
    productRepository.update.mockReturnValueOnce([responseModel])

    const sutResult = await sut.execute(requestModel)

    expect(sutResult).toStrictEqual(responseModel)
    expect(updateProductValidation.firstValidation).toBeCalledWith(sanitizedRequestModel)
    expect(productRepository.findBy).toBeCalledWith([{ id: sanitizedRequestModel.id }])
    expect(updateProductValidation.secondValidation).toBeCalledWith({ products: [existsProduct] })
    expect(productRepository.update).toBeCalledWith(
      { id: sanitizedRequestModel.id },
      sanitizedRequestModel
    )
  })

  test('Should throws if firstValidation throws', async () => {
    const { updateProductValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      name: 'Any Name',
      email: 'any@email.com',
      password: 'Password@123',
      roles: [],
      anyWrongProp: 'anyValue'
    }
    const error = new Error('firstValidation Error')

    updateProductValidation.firstValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })

  test('Should throws if secondValidation throws', async () => {
    const { updateProductValidation, sut } = makeSut()

    const requestModel = {
      id: validUuidV4,
      name: 'Any Name',
      email: 'any@email.com',
      password: 'Password@123',
      roles: [],
      anyWrongProp: 'anyValue'
    }
    const error = new Error('secondValidation Error')

    updateProductValidation.secondValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })
})

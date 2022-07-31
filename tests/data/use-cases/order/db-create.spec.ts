import {
  makeOrderItemRepositoryStub,
  makeOrderRepositoryStub,
  makeProductRepositoryStub
} from '@tests/data/stubs/repositories'
import { makeCreateOrderValidationStub } from '@tests/data/stubs/validations'
import { makeProductModelMock, makeSessionModelMock } from '@tests/domain/mocks/models'

import { DbCreateOrderUseCase } from '@/data/use-cases'

const validUuidV4 = '00000000-0000-4000-8000-000000000001'

function makeSut() {
  const orderRepository = makeOrderRepositoryStub()
  const orderItemRepository = makeOrderItemRepositoryStub()
  const productRepository = makeProductRepositoryStub()
  const createOrderValidation = makeCreateOrderValidationStub()
  const session = makeSessionModelMock()
  const sut = new DbCreateOrderUseCase(
    orderRepository,
    orderItemRepository,
    productRepository,
    createOrderValidation.firstValidation,
    session
  )

  return {
    orderRepository,
    orderItemRepository,
    productRepository,
    createOrderValidation,
    session,
    sut
  }
}

describe(DbCreateOrderUseCase.name, () => {
  test('Should create order and return correct values', async () => {
    const {
      orderRepository,
      orderItemRepository,
      productRepository,
      createOrderValidation,
      session,
      sut
    } = makeSut()

    const requestModel = {
      anyWrongProp: 'anyValue',
      orderItems: [{ productId: validUuidV4, quantity: 1, anyWrongProp: 'anyValue' }]
    }
    const sanitizedRequestModel = {
      ...requestModel,
      userId: session.userId,
      orderItems: [{ ...requestModel.orderItems[0] }]
    }
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp')
    Reflect.deleteProperty(sanitizedRequestModel.orderItems[0], 'anyWrongProp')
    const orderWithValues = {
      ...sanitizedRequestModel,
      totalValue: 1000
    }
    Reflect.deleteProperty(orderWithValues, 'orderItems')
    const orderItemWithValues = {
      ...sanitizedRequestModel.orderItems[0],
      unitValue: 1000,
      totalValue: 1000
    }
    const orderCreated = {
      ...orderWithValues,
      id: 'any_id',
      createdAt: new Date()
    }
    const orderItemCreated = {
      ...orderItemWithValues,
      orderId: 'any_id',
      id: 'any_id',
      createdAt: new Date()
    }
    const responseModel = { ...orderCreated, orderItems: [orderItemCreated] }
    const product = makeProductModelMock()

    productRepository.findBy.mockReturnValueOnce([product])
    orderRepository.create.mockReturnValueOnce([orderCreated])
    orderItemRepository.create.mockReturnValueOnce([orderItemCreated])

    const sutResult = await sut.execute(requestModel)

    expect(sutResult).toStrictEqual(responseModel)
    expect(createOrderValidation.firstValidation).toBeCalledWith(sanitizedRequestModel)
    expect(productRepository.findBy).toBeCalledWith([
      { id: sanitizedRequestModel.orderItems[0].productId }
    ])
    expect(createOrderValidation.secondValidation).toBeCalledWith({ products: [product] })
    expect(orderRepository.create).toBeCalledWith([orderWithValues])
    expect(orderItemRepository.create).toBeCalledWith([
      { ...orderItemWithValues, orderId: 'any_id' }
    ])
  })

  test('Should throws if firstValidation throws', async () => {
    const { createOrderValidation, sut } = makeSut()

    const requestModel = {
      orderItems: [{ productId: validUuidV4, quantity: 1 }]
    }
    const error = new Error('firstValidation Error')

    createOrderValidation.firstValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })

  test('Should throws if secondValidation throws', async () => {
    const { createOrderValidation, sut } = makeSut()

    const requestModel = {
      orderItems: [{ productId: validUuidV4, quantity: 1 }]
    }
    const error = new Error('secondValidation Error')

    createOrderValidation.secondValidation.mockReturnValueOnce(Promise.reject(error))

    const sutResult = sut.execute(requestModel)

    await expect(sutResult).rejects.toStrictEqual(error)
  })
})
